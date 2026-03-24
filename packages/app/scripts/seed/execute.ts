/**
 * Execution logic for database seeding.
 * Uses SDK operations to create spaces, rooms, messages, and reactions.
 */

import {
  type RoomyClient,
  ConnectedSpace,
  modules,
  UserDid,
  type Ulid,
  newUlid,
  createDefaultSpaceEvents,
  updateSidebarEvents,
  type SidebarCategory,
  createRoom,
  createThread,
  createPage,
  createMessage,
  addReaction,
} from "@roomy/sdk";
import type { SeedData, SeedRoom, SeedMessage } from "./data";

interface SpaceContext {
  space: ConnectedSpace;
  lobbyId: Ulid;
  roomMap: Map<string, Ulid>;
  messageMap: Map<string, Ulid[]>;
}

/**
 * Execute the seeding process for all spaces.
 */
export async function executeSeed(
  client: RoomyClient,
  personalSpace: ConnectedSpace,
  seedData: SeedData,
): Promise<void> {
  console.log("[Seed] Starting database seed...");

  const userDid = UserDid.assert(client.agent.did);
  const spaceContexts = new Map<string, SpaceContext>();

  // Create all spaces
  for (const spaceData of seedData.spaces) {
    try {
      console.log(`[Seed] Creating space: ${spaceData.name}`);
      const context = await createSpaceWithStructure(
        client,
        userDid,
        spaceData.name,
        spaceData.description,
      );
      spaceContexts.set(spaceData.name, context);
    } catch (error) {
      console.error(`[Seed] Failed to create space ${spaceData.name}:`, error);
      throw error;
    }
  }

  // Create rooms for each space
  for (const roomData of seedData.rooms) {
    const context = spaceContexts.get(roomData.spaceName);
    if (!context) {
      console.warn(`[Seed] Space not found: ${roomData.spaceName}`);
      continue;
    }

    try {
      await createRoomInSpace(context, roomData);
    } catch (error) {
      console.error(
        `[Seed] Failed to create room ${roomData.name} in ${roomData.spaceName}:`,
        error,
      );
    }
  }

  // Update sidebars for each space
  for (const [spaceName, context] of Array.from(spaceContexts.entries())) {
    try {
      const rooms = seedData.rooms.filter((r) => r.spaceName === spaceName);
      await updateSpaceSidebar(context, rooms);
    } catch (error) {
      console.error(`[Seed] Failed to update sidebar for ${spaceName}:`, error);
    }
  }

  // Create messages for each space
  for (const messageData of seedData.messages) {
    const context = spaceContexts.get(messageData.spaceName);
    if (!context) {
      console.warn(`[Seed] Space not found: ${messageData.spaceName}`);
      continue;
    }

    try {
      await createMessageInSpace(context, messageData);
    } catch (error) {
      console.error(
        `[Seed] Failed to create message in ${messageData.spaceName}:`,
        error,
      );
    }
  }

  // Add reactions
  for (const messageData of seedData.messages) {
    if (!messageData.reactions || messageData.reactions.length === 0) {
      continue;
    }

    const context = spaceContexts.get(messageData.spaceName);
    if (!context) continue;

    const roomId = context.roomMap.get(messageData.room);
    if (!roomId) continue;

    const messages = context.messageMap.get(messageData.room);
    if (!messages) continue;

    // Find the message by its index in the room
    const roomMessages = seedData.messages.filter(
      (m) => m.spaceName === messageData.spaceName && m.room === messageData.room,
    );
    const messageIndex = roomMessages.indexOf(messageData);
    const messageId = messages[messageIndex];
    if (!messageId) continue;

    try {
      for (const reaction of messageData.reactions) {
        await addReaction(context.space, {
          roomId,
          messageId,
          reaction: reaction.emoji,
        });
      }
    } catch (error) {
      console.error(`[Seed] Failed to add reactions:`, error);
    }
  }

  // Join all spaces in personal stream
  for (const [spaceName, context] of Array.from(spaceContexts.entries())) {
    try {
      console.log(`[Seed] Joining space in personal stream: ${spaceName}`);
      await personalSpace.sendEvent({
        id: newUlid(),
        $type: "space.roomy.space.personal.joinSpace.v0",
        spaceDid: context.space.streamDid,
      });
    } catch (error) {
      console.error(`[Seed] Failed to join space ${spaceName}:`, error);
    }
  }

  console.log("[Seed] Database seed complete!");
}

/**
 * Create a space with default structure.
 */
async function createSpaceWithStructure(
  client: RoomyClient,
  userDid: UserDid,
  name: string,
  description: string,
): Promise<SpaceContext> {
  // Create the space stream
  const space = await ConnectedSpace.create(
    {
      client,
      module: modules.space,
    },
    userDid,
  );

  console.log(`[Seed] Created space stream: ${space.streamDid}`);

  // Send default space events (space info, lobby, sidebar)
  const events = createDefaultSpaceEvents({ name, description });
  await space.sendEvents(events);

  // Extract lobby ID from events
  const lobbyEvent = events[1];
  if (!lobbyEvent?.id) {
    throw new Error("Failed to get lobby ID from default space events");
  }
  const lobbyId = lobbyEvent.id;

  console.log(`[Seed] Initialized space: ${name}`);

  return {
    space,
    lobbyId,
    roomMap: new Map([["lobby", lobbyId]]),
    messageMap: new Map(),
  };
}

/**
 * Create a room in a space.
 */
async function createRoomInSpace(
  context: SpaceContext,
  roomData: SeedRoom,
): Promise<void> {
  if (roomData.type === "channel") {
    const events = createRoom({
      kind: "space.roomy.channel",
      name: roomData.name,
    });
    await context.space.sendEvents(events);
    const roomId = events[0]?.id;
    if (roomId) {
      context.roomMap.set(roomData.name, roomId);
      console.log(`[Seed] Created channel: ${roomData.name}`);
    }
  } else if (roomData.type === "thread") {
    const parentRoomId = context.roomMap.get(roomData.parentChannel || "lobby");
    if (!parentRoomId) {
      console.warn(
        `[Seed] Parent channel not found: ${roomData.parentChannel}`,
      );
      return;
    }

    const events = createThread({
      linkToRoom: parentRoomId,
      name: roomData.name,
    });
    await context.space.sendEvents(events);
    const threadId = events[0]?.id;
    if (threadId) {
      context.roomMap.set(roomData.name, threadId);
      console.log(`[Seed] Created thread: ${roomData.name}`);
    }
  } else if (roomData.type === "page") {
    const parentRoomId = context.roomMap.get(roomData.parentChannel || "lobby");
    if (!parentRoomId) {
      console.warn(
        `[Seed] Parent channel not found: ${roomData.parentChannel}`,
      );
      return;
    }

    const events = createPage({
      parentRoomId,
      name: roomData.name,
      content: roomData.content,
    });
    await context.space.sendEvents(events);
    const pageId = events[0]?.id;
    if (pageId) {
      context.roomMap.set(roomData.name, pageId);
      console.log(`[Seed] Created page: ${roomData.name}`);
    }
  }
}

/**
 * Update the sidebar with categories and room organization.
 */
async function updateSpaceSidebar(
  context: SpaceContext,
  rooms: SeedRoom[],
): Promise<void> {
  // Group rooms by category
  const categoryMap = new Map<string, Ulid[]>();

  // Add lobby to its category
  const lobbyRoom = rooms.find((r) => r.name === "lobby");
  const lobbyCategory = lobbyRoom?.category || "general";
  categoryMap.set(lobbyCategory, [context.lobbyId]);

  // Add other rooms (excluding threads and pages)
  for (const room of rooms) {
    if (room.type !== "channel") continue; // Only channels go in sidebar
    if (room.name === "lobby") continue; // Already added

    const roomId = context.roomMap.get(room.name);
    if (!roomId) continue;

    const existing = categoryMap.get(room.category) || [];
    categoryMap.set(room.category, [...existing, roomId]);
  }

  // Convert to SidebarCategory format
  const categories: SidebarCategory[] = Array.from(categoryMap.entries()).map(
    ([name, children]) => ({
      id: newUlid(),
      name,
      children,
    }),
  );

  const event = updateSidebarEvents(categories);
  await context.space.sendEvent(event);
  console.log(`[Seed] Updated sidebar with ${categories.length} categories`);
}

/**
 * Create a message in a space.
 */
async function createMessageInSpace(
  context: SpaceContext,
  messageData: SeedMessage,
): Promise<void> {
  const roomId = context.roomMap.get(messageData.room);
  if (!roomId) {
    console.warn(`[Seed] Room not found: ${messageData.room}`);
    return;
  }

  // Calculate timestamp (days ago -> unix timestamp in milliseconds)
  const timestamp =
    Date.now() - messageData.timestampOffsetDays * 24 * 60 * 60 * 1000;

  // Handle reply-to
  let replyTo: Ulid | undefined;
  if (messageData.replyTo !== undefined) {
    const roomMessages = context.messageMap.get(messageData.room) || [];
    replyTo = roomMessages[messageData.replyTo];
  }

  const result = await createMessage(context.space, {
    roomId,
    body: messageData.body,
    timestamp,
    ...(replyTo && { replyTo }),
  });

  // Track message ID for replies and reactions
  const roomMessages = context.messageMap.get(messageData.room) || [];
  roomMessages.push(result.id);
  context.messageMap.set(messageData.room, roomMessages);
}
