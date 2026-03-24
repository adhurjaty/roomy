/**
 * Sample data for dev database seeding.
 * Generates realistic conversation data across multiple spaces.
 */

export interface SeedSpace {
  name: string;
  description: string;
}

export interface SeedRoom {
  spaceName: string;
  name: string;
  type: "channel" | "thread" | "page";
  parentChannel?: string;
  category: string;
  content?: string;
}

export interface SeedMessage {
  spaceName: string;
  room: string;
  body: string;
  replyTo?: number;
  timestampOffsetDays: number;
  reactions?: Array<{ emoji: string }>;
}

export interface SeedData {
  spaces: SeedSpace[];
  rooms: SeedRoom[];
  messages: SeedMessage[];
}

/**
 * Generate sample data for seeding the database.
 * Creates 3 spaces with channels, threads, pages, and messages.
 */
export function generateSeedData(): SeedData {
  return {
    spaces: [
      {
        name: "Welcome to Roomy",
        description: "Your first space - explore the features!",
      },
      {
        name: "Project Workspace",
        description: "Collaborate on projects and tasks",
      },
      {
        name: "Community",
        description: "Connect with others",
      },
    ],

    rooms: [
      // Welcome to Roomy space
      { spaceName: "Welcome to Roomy", name: "announcements", type: "channel", category: "General" },
      { spaceName: "Welcome to Roomy", name: "general", type: "channel", category: "General" },
      { spaceName: "Welcome to Roomy", name: "help", type: "channel", category: "Support" },
      { spaceName: "Welcome to Roomy", name: "random", type: "channel", category: "Off-topic" },
      {
        spaceName: "Welcome to Roomy",
        name: "Getting Started Tips",
        type: "thread",
        parentChannel: "lobby",
        category: "General",
      },
      {
        spaceName: "Welcome to Roomy",
        name: "Feature Requests",
        type: "thread",
        parentChannel: "general",
        category: "General",
      },
      {
        spaceName: "Welcome to Roomy",
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

Pages are for documentation, guides, and persistent information.

Get started by exploring the channels in this space!`,
      },

      // Project Workspace
      { spaceName: "Project Workspace", name: "tasks", type: "channel", category: "Main" },
      { spaceName: "Project Workspace", name: "updates", type: "channel", category: "Main" },
      { spaceName: "Project Workspace", name: "resources", type: "channel", category: "Resources" },
      {
        spaceName: "Project Workspace",
        name: "Sprint Planning",
        type: "thread",
        parentChannel: "tasks",
        category: "Main",
      },
      {
        spaceName: "Project Workspace",
        name: "Design Discussion",
        type: "thread",
        parentChannel: "updates",
        category: "Main",
      },
      {
        spaceName: "Project Workspace",
        name: "Project Overview",
        type: "page",
        parentChannel: "lobby",
        category: "Main",
        content: `# Project Overview

This space is for project collaboration.

## Goals

- Organize tasks effectively
- Share updates regularly
- Keep resources accessible

## Getting Started

Check the tasks channel for current work items.`,
      },

      // Community space
      { spaceName: "Community", name: "chat", type: "channel", category: "Main" },
      { spaceName: "Community", name: "announcements", type: "channel", category: "Main" },
      {
        spaceName: "Community",
        name: "Introductions",
        type: "thread",
        parentChannel: "lobby",
        category: "Main",
      },
      {
        spaceName: "Community",
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

    messages: [
      // Welcome to Roomy - lobby
      {
        spaceName: "Welcome to Roomy",
        room: "lobby",
        body: "Welcome to Roomy! 👋",
        timestampOffsetDays: 14,
        reactions: [{ emoji: "👍" }, { emoji: "❤️" }],
      },
      {
        spaceName: "Welcome to Roomy",
        room: "lobby",
        body: "This is the lobby - the main channel for general discussion.",
        timestampOffsetDays: 14,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "lobby",
        body: "Feel free to explore the other channels!",
        timestampOffsetDays: 13,
        reactions: [{ emoji: "🎉" }],
      },

      // Welcome to Roomy - Getting Started Tips thread
      {
        spaceName: "Welcome to Roomy",
        room: "Getting Started Tips",
        body: "Let's share some tips for new users!",
        timestampOffsetDays: 13,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "Getting Started Tips",
        body: "Tip: Use threads to keep focused discussions separate from main channels.",
        replyTo: 0,
        timestampOffsetDays: 13,
        reactions: [{ emoji: "💡" }],
      },
      {
        spaceName: "Welcome to Roomy",
        room: "Getting Started Tips",
        body: "Another tip: Pages are great for documentation that you want to reference later.",
        replyTo: 0,
        timestampOffsetDays: 12,
      },

      // Welcome to Roomy - announcements
      {
        spaceName: "Welcome to Roomy",
        room: "announcements",
        body: "📢 Welcome to the announcements channel!",
        timestampOffsetDays: 12,
        reactions: [{ emoji: "📢" }],
      },
      {
        spaceName: "Welcome to Roomy",
        room: "announcements",
        body: "This is where important updates will be posted.",
        timestampOffsetDays: 12,
      },

      // Welcome to Roomy - general
      {
        spaceName: "Welcome to Roomy",
        room: "general",
        body: "Hello everyone!",
        timestampOffsetDays: 11,
        reactions: [{ emoji: "👋" }],
      },
      {
        spaceName: "Welcome to Roomy",
        room: "general",
        body: "How's everyone doing today?",
        timestampOffsetDays: 11,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "general",
        body: "Great to see you here!",
        replyTo: 0,
        timestampOffsetDays: 10,
        reactions: [{ emoji: "😊" }],
      },

      // Welcome to Roomy - Feature Requests thread
      {
        spaceName: "Welcome to Roomy",
        room: "Feature Requests",
        body: "What features would you like to see?",
        timestampOffsetDays: 10,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "Feature Requests",
        body: "I'd love to see more customization options!",
        replyTo: 0,
        timestampOffsetDays: 9,
        reactions: [{ emoji: "🚀" }],
      },

      // Welcome to Roomy - help
      {
        spaceName: "Welcome to Roomy",
        room: "help",
        body: "Need help? Ask questions here!",
        timestampOffsetDays: 9,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "help",
        body: "How do I create a new channel?",
        timestampOffsetDays: 8,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "help",
        body: "You can create channels from the space settings menu.",
        replyTo: 1,
        timestampOffsetDays: 8,
        reactions: [{ emoji: "👍" }],
      },

      // Welcome to Roomy - random
      {
        spaceName: "Welcome to Roomy",
        room: "random",
        body: "Random thoughts and off-topic chat go here!",
        timestampOffsetDays: 7,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "random",
        body: "Anyone have any interesting weekend plans?",
        timestampOffsetDays: 6,
      },
      {
        spaceName: "Welcome to Roomy",
        room: "random",
        body: "Just relaxing and exploring Roomy!",
        replyTo: 1,
        timestampOffsetDays: 5,
        reactions: [{ emoji: "😎" }],
      },

      // Project Workspace - lobby
      {
        spaceName: "Project Workspace",
        room: "lobby",
        body: "Welcome to the Project Workspace!",
        timestampOffsetDays: 10,
        reactions: [{ emoji: "🚀" }],
      },
      {
        spaceName: "Project Workspace",
        room: "lobby",
        body: "Let's build something amazing together.",
        timestampOffsetDays: 10,
      },

      // Project Workspace - tasks
      {
        spaceName: "Project Workspace",
        room: "tasks",
        body: "Here's where we track our tasks and to-dos.",
        timestampOffsetDays: 9,
      },
      {
        spaceName: "Project Workspace",
        room: "tasks",
        body: "Current priority: Setting up the project structure",
        timestampOffsetDays: 8,
        reactions: [{ emoji: "📋" }],
      },

      // Project Workspace - Sprint Planning thread
      {
        spaceName: "Project Workspace",
        room: "Sprint Planning",
        body: "Let's plan our next sprint!",
        timestampOffsetDays: 8,
      },
      {
        spaceName: "Project Workspace",
        room: "Sprint Planning",
        body: "We should focus on the core features first.",
        replyTo: 0,
        timestampOffsetDays: 7,
        reactions: [{ emoji: "💪" }],
      },

      // Project Workspace - updates
      {
        spaceName: "Project Workspace",
        room: "updates",
        body: "Share project updates here!",
        timestampOffsetDays: 7,
      },
      {
        spaceName: "Project Workspace",
        room: "updates",
        body: "Progress update: Initial setup complete ✅",
        timestampOffsetDays: 6,
        reactions: [{ emoji: "✅" }, { emoji: "🎉" }],
      },

      // Project Workspace - Design Discussion thread
      {
        spaceName: "Project Workspace",
        room: "Design Discussion",
        body: "Let's discuss design decisions here.",
        timestampOffsetDays: 6,
      },
      {
        spaceName: "Project Workspace",
        room: "Design Discussion",
        body: "I think we should keep the interface simple and intuitive.",
        replyTo: 0,
        timestampOffsetDays: 5,
      },

      // Project Workspace - resources
      {
        spaceName: "Project Workspace",
        room: "resources",
        body: "Share useful resources and documentation here.",
        timestampOffsetDays: 5,
      },
      {
        spaceName: "Project Workspace",
        room: "resources",
        body: "Check out the Project Overview page for more details!",
        timestampOffsetDays: 4,
        reactions: [{ emoji: "📚" }],
      },

      // Community - lobby
      {
        spaceName: "Community",
        room: "lobby",
        body: "Welcome to our community! 🎉",
        timestampOffsetDays: 8,
        reactions: [{ emoji: "🎉" }, { emoji: "👋" }],
      },

      // Community - Introductions thread
      {
        spaceName: "Community",
        room: "Introductions",
        body: "Introduce yourself here!",
        timestampOffsetDays: 8,
      },
      {
        spaceName: "Community",
        room: "Introductions",
        body: "Hi everyone! Excited to be here!",
        replyTo: 0,
        timestampOffsetDays: 7,
        reactions: [{ emoji: "👋" }],
      },
      {
        spaceName: "Community",
        room: "Introductions",
        body: "Welcome! Great to have you!",
        replyTo: 1,
        timestampOffsetDays: 7,
      },

      // Community - chat
      {
        spaceName: "Community",
        room: "chat",
        body: "This is the main chat channel!",
        timestampOffsetDays: 6,
      },
      {
        spaceName: "Community",
        room: "chat",
        body: "What's everyone working on today?",
        timestampOffsetDays: 5,
      },
      {
        spaceName: "Community",
        room: "chat",
        body: "Just exploring and learning!",
        replyTo: 1,
        timestampOffsetDays: 4,
        reactions: [{ emoji: "📚" }],
      },

      // Community - announcements
      {
        spaceName: "Community",
        room: "announcements",
        body: "📢 Community announcements will be posted here.",
        timestampOffsetDays: 4,
        reactions: [{ emoji: "📢" }],
      },
      {
        spaceName: "Community",
        room: "announcements",
        body: "Remember to check the Community Guidelines page!",
        timestampOffsetDays: 3,
      },
    ],
  };
}
