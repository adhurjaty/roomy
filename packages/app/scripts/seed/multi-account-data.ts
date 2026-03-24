/**
 * Multi-account seed data generator.
 * Creates customized seed data for each local development account.
 */

import type { SeedData, SeedSpace, SeedRoom, SeedMessage } from "./data";

export interface AccountPersona {
  name: string;
  handle: string;
  spaces: Array<{
    name: string;
    description: string;
    theme: "welcome" | "projects" | "community" | "workshop" | "hub" | "roadmap" | "testing";
  }>;
}

export const ACCOUNT_PERSONAS: AccountPersona[] = [
  {
    name: "Alice",
    handle: "alice.test",
    spaces: [
      {
        name: "Welcome to Roomy",
        description: "Your first space - explore the features!",
        theme: "welcome",
      },
      {
        name: "Alice's Projects",
        description: "Personal project workspace",
        theme: "projects",
      },
    ],
  },
  {
    name: "Bob",
    handle: "bob.test",
    spaces: [
      {
        name: "Welcome to Roomy",
        description: "Your first space - explore the features!",
        theme: "welcome",
      },
      {
        name: "Bob's Workshop",
        description: "Experiments and side projects",
        theme: "workshop",
      },
    ],
  },
  {
    name: "Carol",
    handle: "carol.test",
    spaces: [
      {
        name: "Welcome to Roomy",
        description: "Your first space - explore the features!",
        theme: "welcome",
      },
      {
        name: "Community Hub",
        description: "Connect with others and share ideas",
        theme: "hub",
      },
    ],
  },
  {
    name: "Dave",
    handle: "dave.test",
    spaces: [
      {
        name: "Welcome to Roomy",
        description: "Your first space - explore the features!",
        theme: "welcome",
      },
      {
        name: "Dave's Roadmap",
        description: "Product planning and ideas",
        theme: "roadmap",
      },
    ],
  },
  {
    name: "Eve",
    handle: "eve.test",
    spaces: [
      {
        name: "Welcome to Roomy",
        description: "Your first space - explore the features!",
        theme: "welcome",
      },
      {
        name: "Testing Space",
        description: "Quality assurance and testing",
        theme: "testing",
      },
    ],
  },
];

/**
 * Generate seed data customized for a specific account.
 */
export function generateSeedDataForAccount(
  accountName: string,
  accountIndex: number,
): SeedData {
  const persona = ACCOUNT_PERSONAS[accountIndex];
  if (!persona) {
    throw new Error(`No persona found for account index ${accountIndex}`);
  }

  const spaces: SeedSpace[] = [];
  const rooms: SeedRoom[] = [];
  const messages: SeedMessage[] = [];

  for (const spaceConfig of persona.spaces) {
    spaces.push({
      name: spaceConfig.name,
      description: spaceConfig.description,
    });

    const spaceRooms = generateRoomsForTheme(spaceConfig.name, spaceConfig.theme);
    rooms.push(...spaceRooms);

    const spaceMessages = generateMessagesForTheme(
      spaceConfig.name,
      spaceConfig.theme,
      accountName,
    );
    messages.push(...spaceMessages);
  }

  return { spaces, rooms, messages };
}

/**
 * Generate rooms based on the space theme.
 */
function generateRoomsForTheme(spaceName: string, theme: string): SeedRoom[] {
  const baseRooms: SeedRoom[] = [
    { spaceName, name: "announcements", type: "channel", category: "General" },
    { spaceName, name: "general", type: "channel", category: "General" },
  ];

  const themeRooms: Record<string, SeedRoom[]> = {
    welcome: [
      { spaceName, name: "help", type: "channel", category: "Support" },
      { spaceName, name: "random", type: "channel", category: "Off-topic" },
      {
        spaceName,
        name: "Getting Started Tips",
        type: "thread",
        parentChannel: "lobby",
        category: "General",
      },
      {
        spaceName,
        name: "Quick Start Guide",
        type: "page",
        parentChannel: "lobby",
        category: "General",
        content: `# Quick Start Guide

Welcome to Roomy! This guide will help you get started.

## Spaces

Spaces are your workspaces. Each space can have multiple channels, threads, and pages.

## Channels

Channels are where conversations happen. Use them to organize topics.

## Threads

Threads help keep focused discussions separate from the main channel.

## Pages

Pages are for documentation, guides, and persistent information.`,
      },
    ],
    projects: [
      { spaceName, name: "tasks", type: "channel", category: "Work" },
      { spaceName, name: "updates", type: "channel", category: "Work" },
      { spaceName, name: "resources", type: "channel", category: "Resources" },
      {
        spaceName,
        name: "Sprint Planning",
        type: "thread",
        parentChannel: "tasks",
        category: "Work",
      },
      {
        spaceName,
        name: "Project Overview",
        type: "page",
        parentChannel: "lobby",
        category: "Work",
        content: `# Project Overview

This space is for project collaboration.

## Current Projects
- Project Alpha: In progress
- Project Beta: Planning phase

## Resources
Check the resources channel for useful links and documentation.`,
      },
    ],
    workshop: [
      { spaceName, name: "ideas", type: "channel", category: "Main" },
      { spaceName, name: "experiments", type: "channel", category: "Main" },
      { spaceName, name: "resources", type: "channel", category: "Resources" },
      {
        spaceName,
        name: "Experiment Notes",
        type: "thread",
        parentChannel: "experiments",
        category: "Main",
      },
    ],
    hub: [
      { spaceName, name: "chat", type: "channel", category: "Main" },
      { spaceName, name: "events", type: "channel", category: "Main" },
      {
        spaceName,
        name: "Introductions",
        type: "thread",
        parentChannel: "lobby",
        category: "Main",
      },
      {
        spaceName,
        name: "Community Guidelines",
        type: "page",
        parentChannel: "lobby",
        category: "Main",
        content: `# Community Guidelines

Welcome to our community!

## Be Respectful
Treat everyone with kindness and respect.

## Stay On Topic
Keep conversations relevant to the channel.

## Have Fun
Enjoy connecting with others!`,
      },
    ],
    roadmap: [
      { spaceName, name: "planning", type: "channel", category: "Main" },
      { spaceName, name: "features", type: "channel", category: "Main" },
      { spaceName, name: "feedback", type: "channel", category: "Main" },
      {
        spaceName,
        name: "Q1 Goals",
        type: "thread",
        parentChannel: "planning",
        category: "Main",
      },
    ],
    testing: [
      { spaceName, name: "test-cases", type: "channel", category: "Main" },
      { spaceName, name: "bug-reports", type: "channel", category: "Main" },
      { spaceName, name: "automation", type: "channel", category: "Main" },
      {
        spaceName,
        name: "Test Plan",
        type: "thread",
        parentChannel: "test-cases",
        category: "Main",
      },
    ],
  };

  return [...baseRooms, ...(themeRooms[theme] || [])];
}

/**
 * Generate messages based on the space theme.
 */
function generateMessagesForTheme(
  spaceName: string,
  theme: string,
  accountName: string,
): SeedMessage[] {
  const baseMessages: SeedMessage[] = [
    {
      spaceName,
      room: "lobby",
      body: `Welcome to ${spaceName}! 👋`,
      timestampOffsetDays: 14,
      reactions: [{ emoji: "👍" }, { emoji: "❤️" }],
    },
    {
      spaceName,
      room: "lobby",
      body: "This is the lobby - the main channel for general discussion.",
      timestampOffsetDays: 14,
    },
    {
      spaceName,
      room: "announcements",
      body: "📢 Welcome to the announcements channel!",
      timestampOffsetDays: 12,
      reactions: [{ emoji: "📢" }],
    },
    {
      spaceName,
      room: "general",
      body: "Hello everyone!",
      timestampOffsetDays: 11,
      reactions: [{ emoji: "👋" }],
    },
    {
      spaceName,
      room: "general",
      body: "How's everyone doing today?",
      timestampOffsetDays: 10,
    },
  ];

  const themeMessages: Record<string, SeedMessage[]> = {
    welcome: [
      {
        spaceName,
        room: "Getting Started Tips",
        body: "Let's share some tips for new users!",
        timestampOffsetDays: 13,
      },
      {
        spaceName,
        room: "Getting Started Tips",
        body: "Tip: Use threads to keep focused discussions separate from main channels.",
        replyTo: 0,
        timestampOffsetDays: 13,
        reactions: [{ emoji: "💡" }],
      },
      {
        spaceName,
        room: "help",
        body: "Need help? Ask questions here!",
        timestampOffsetDays: 9,
      },
      {
        spaceName,
        room: "random",
        body: "Random thoughts and off-topic chat go here!",
        timestampOffsetDays: 7,
      },
    ],
    projects: [
      {
        spaceName,
        room: "tasks",
        body: "Here's where we track our tasks and to-dos.",
        timestampOffsetDays: 9,
      },
      {
        spaceName,
        room: "tasks",
        body: "Current priority: Setting up the project structure",
        timestampOffsetDays: 8,
        reactions: [{ emoji: "📋" }],
      },
      {
        spaceName,
        room: "Sprint Planning",
        body: "Let's plan our next sprint!",
        timestampOffsetDays: 8,
      },
      {
        spaceName,
        room: "updates",
        body: "Progress update: Initial setup complete ✅",
        timestampOffsetDays: 6,
        reactions: [{ emoji: "✅" }, { emoji: "🎉" }],
      },
    ],
    workshop: [
      {
        spaceName,
        room: "ideas",
        body: "Share your project ideas here!",
        timestampOffsetDays: 9,
      },
      {
        spaceName,
        room: "ideas",
        body: "I'm thinking about building a... 🤔",
        timestampOffsetDays: 8,
        reactions: [{ emoji: "💡" }],
      },
      {
        spaceName,
        room: "experiments",
        body: "Current experiments and prototypes",
        timestampOffsetDays: 7,
      },
      {
        spaceName,
        room: "Experiment Notes",
        body: "Notes from today's experiments",
        timestampOffsetDays: 6,
      },
    ],
    hub: [
      {
        spaceName,
        room: "chat",
        body: "This is the main chat channel!",
        timestampOffsetDays: 9,
      },
      {
        spaceName,
        room: "Introductions",
        body: "Introduce yourself here!",
        timestampOffsetDays: 8,
      },
      {
        spaceName,
        room: "Introductions",
        body: `Hi everyone! I'm ${accountName}!`,
        replyTo: 0,
        timestampOffsetDays: 7,
        reactions: [{ emoji: "👋" }],
      },
      {
        spaceName,
        room: "events",
        body: "Upcoming community events",
        timestampOffsetDays: 6,
      },
    ],
    roadmap: [
      {
        spaceName,
        room: "planning",
        body: "Strategic planning and roadmap discussions",
        timestampOffsetDays: 9,
      },
      {
        spaceName,
        room: "features",
        body: "Feature requests and ideas",
        timestampOffsetDays: 8,
        reactions: [{ emoji: "🚀" }],
      },
      {
        spaceName,
        room: "Q1 Goals",
        body: "Let's define our Q1 objectives",
        timestampOffsetDays: 7,
      },
      {
        spaceName,
        room: "feedback",
        body: "Your feedback helps us improve!",
        timestampOffsetDays: 6,
      },
    ],
    testing: [
      {
        spaceName,
        room: "test-cases",
        body: "Test case documentation and tracking",
        timestampOffsetDays: 9,
      },
      {
        spaceName,
        room: "bug-reports",
        body: "Report bugs and issues here",
        timestampOffsetDays: 8,
        reactions: [{ emoji: "🐛" }],
      },
      {
        spaceName,
        room: "Test Plan",
        body: "Test plan for the next release",
        timestampOffsetDays: 7,
      },
      {
        spaceName,
        room: "automation",
        body: "Automation scripts and tools",
        timestampOffsetDays: 6,
      },
    ],
  };

  return [...baseMessages, ...(themeMessages[theme] || [])];
}
