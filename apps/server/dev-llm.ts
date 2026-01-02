import { call } from '@orpc/server';
// eslint-disable-next-line import-x/no-extraneous-dependencies -- dev script uses devDependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import 'reflect-metadata';

/**
 * dev-llm.ts
 *
 * This script sets up an in-memory MongoDB instance and starts the server
 * with pre-seeded mock data for LLM agents to interact with.
 *
 * Usage: bun run dev:llm (from root) or bun run llm (from apps/server)
 */

// Set NODE_ENV to test BEFORE any imports to prevent external database connection
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'dev-llm-secret-key-for-testing-only';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.SERVER_PORT = '3000';
process.env.SERVER_HOST = 'localhost';
process.env.CORS_ORIGIN = 'http://localhost:3001';

process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'dev-llm-secret-key-for-testing-only';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.SERVER_PORT = '3000';
process.env.SERVER_HOST = 'localhost';
process.env.CORS_ORIGIN = 'http://localhost:3001';

console.log('🤖 Starting LLM Development Environment...\n');

// Setup in-memory MongoDB
console.log('📦 Creating in-memory MongoDB server...');
const mongo = await MongoMemoryServer.create({
  instance: {
    storageEngine: 'ephemeralForTest',
  },
});

const uri = mongo.getUri();
console.log(`✓ MongoDB URI: ${uri}`);

await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
});
console.log('✓ Connected to in-memory MongoDB\n');

// Import loaders after setting environment
const { default: loaders } = await import('./src/loaders');

console.log('🚀 Loading server components...');
const { app, appRouter, auth } = await loaders();
console.log('✓ Server components loaded\n');

// Seed mock data
console.log('🌱 Seeding mock data...\n');

// Helper to create a user session
async function createTestUser(email: string, name: string, password = 'password123') {
  const {
    headers,
    response: { user },
  } = await auth.api.signUpEmail({
    body: { email, name, password },
    returnHeaders: true,
  });

  const cookie = headers.getSetCookie()[0];
  const getSession = await auth.api.getSession({
    headers: { cookie },
  });

  if (!getSession?.session) throw new Error('Failed to create user session');
  const { session } = getSession;

  return {
    user,
    session,
    ctx: () => ({
      context: {
        session: { user, session },
      },
    }),
  };
}

// Create multiple test users
console.log('👥 Creating test users...');
const alice = await createTestUser('alice@example.com', 'Alice Writer');
const bob = await createTestUser('bob@example.com', 'Bob Collaborator');
await createTestUser('charlie@example.com', 'Charlie Director');
console.log('  ✓ Created Alice (alice@example.com / password123)');
console.log('  ✓ Created Bob (bob@example.com / password123)');
console.log('  ✓ Created Charlie (charlie@example.com / password123)\n');

// Create series for Alice
console.log('📚 Creating series and content...');
const aliceSeries = await call(
  appRouter.series.createSeries,
  {
    title: 'The Detective Chronicles',
    genre: 'Mystery',
    logline: 'A brilliant detective solves complex cases in a noir city',
  },
  alice.ctx(),
);
console.log(`  ✓ Series: ${aliceSeries.title} (ID: ${aliceSeries._id})`);

// Create scripts in the series
const script1 = await call(
  appRouter.scripts.createScript,
  {
    seriesId: aliceSeries._id,
    title: 'Episode 1: The First Case',
    authors: ['Alice Writer'],
    genre: 'Mystery',
    logline: 'Detective Morgan investigates a mysterious disappearance',
  },
  alice.ctx(),
);
console.log(`  ✓ Script: ${script1.title}`);

const script2 = await call(
  appRouter.scripts.createScript,
  {
    seriesId: aliceSeries._id,
    title: 'Episode 2: The Plot Thickens',
    authors: ['Alice Writer', 'Bob Collaborator'],
  },
  alice.ctx(),
);
console.log(`  ✓ Script: ${script2.title}`);

// Add content to first script
await call(
  appRouter.scripts.saveScriptContent,
  {
    scriptId: script1._id,
    content: `FADE IN:

INT. DETECTIVE'S OFFICE - NIGHT

A dimly lit office. DETECTIVE MORGAN (40s, weathered but sharp) sits at a cluttered desk, reviewing case files.

MORGAN
(muttering)
Something doesn't add up...

A KNOCK at the door. Enter SARAH CHEN (30s, nervous).

SARAH
Detective Morgan? I need your help.

MORGAN
(looking up)
Take a seat, Ms...?

SARAH
Chen. Sarah Chen. My sister vanished three days ago.

FADE OUT.`,
  },
  alice.ctx(),
);
console.log(`  ✓ Added screenplay content to Episode 1\n`);

// Create knowledge base entries - characters
console.log('👤 Creating characters...');
const detective = await call(
  appRouter.knowledgeBase.characters.create,
  {
    seriesId: aliceSeries._id,
    value: {
      name: 'Detective Morgan',
      description: 'A weathered but brilliant detective with a sharp mind and a troubled past',
      traits: ['intelligent', 'cynical', 'determined', 'haunted'],
      avatarUrl: 'https://example.com/morgan.jpg',
    },
  },
  alice.ctx(),
);
console.log(`  ✓ ${detective.name}`);

const sarah = await call(
  appRouter.knowledgeBase.characters.create,
  {
    seriesId: aliceSeries._id,
    value: {
      name: 'Sarah Chen',
      description: 'A worried sister seeking help to find her missing sibling',
      traits: ['worried', 'persistent', 'caring'],
    },
  },
  alice.ctx(),
);
console.log(`  ✓ ${sarah.name}`);

const partner = await call(
  appRouter.knowledgeBase.characters.create,
  {
    seriesId: aliceSeries._id,
    value: {
      name: 'Officer Blake',
      description: "Morgan's loyal police partner",
      traits: ['loyal', 'by-the-book', 'trustworthy'],
    },
  },
  alice.ctx(),
);
console.log(`  ✓ ${partner.name}\n`);

// Create locations
console.log('📍 Creating locations...');
const office = await call(
  appRouter.knowledgeBase.locations.create,
  {
    seriesId: aliceSeries._id,
    value: {
      name: "Detective's Office",
      description: 'A cluttered office in downtown noir city, filled with case files and cigarette smoke',
      tags: ['interior', 'work', 'private'],
    },
  },
  alice.ctx(),
);
console.log(`  ✓ ${office.name}`);

const precinct = await call(
  appRouter.knowledgeBase.locations.create,
  {
    seriesId: aliceSeries._id,
    value: {
      name: 'Police Precinct',
      description: 'The main police station, always bustling with activity',
      tags: ['interior', 'official', 'public'],
    },
  },
  alice.ctx(),
);
console.log(`  ✓ ${precinct.name}\n`);

// Create props
console.log('🔍 Creating props...');
const badge = await call(
  appRouter.knowledgeBase.props.create,
  {
    seriesId: aliceSeries._id,
    value: {
      name: "Morgan's Detective Badge",
      description: 'A worn detective badge, symbol of authority and responsibility',
    },
  },
  alice.ctx(),
);
console.log(`  ✓ ${badge.name}`);

const caseFile = await call(
  appRouter.knowledgeBase.props.create,
  {
    seriesId: aliceSeries._id,
    value: {
      name: 'Missing Person Case File',
      description: "Sarah Chen's sister's case file with photos and clues",
    },
  },
  alice.ctx(),
);
console.log(`  ✓ ${caseFile.name}\n`);

// Add relationships
console.log('🤝 Creating character relationships...');
await call(
  appRouter.knowledgeBase.addRelationship,
  {
    seriesId: aliceSeries._id,
    characterId: detective._id,
    relationship: {
      targetId: partner._id,
      type: 'partner',
      note: "Blake is Morgan's trusted police partner",
    },
  },
  alice.ctx(),
);
console.log('  ✓ Morgan ↔ Blake (partner)');

await call(
  appRouter.knowledgeBase.addRelationship,
  {
    seriesId: aliceSeries._id,
    characterId: sarah._id,
    relationship: {
      targetId: detective._id,
      type: 'client',
      note: 'Sarah hired Morgan to find her missing sister',
    },
  },
  alice.ctx(),
);
console.log('  ✓ Sarah ↔ Morgan (client)\n');

// Add character appearances
console.log('🎬 Adding character appearances...');
await call(
  appRouter.knowledgeBase.addAppearance,
  {
    seriesId: aliceSeries._id,
    characterId: detective._id,
    appearance: {
      scriptId: script1._id,
      sceneRef: 'Scene 1',
      locationId: office._id,
    },
  },
  alice.ctx(),
);
console.log('  ✓ Morgan appears in Episode 1, Scene 1');

await call(
  appRouter.knowledgeBase.addAppearance,
  {
    seriesId: aliceSeries._id,
    characterId: sarah._id,
    appearance: {
      scriptId: script1._id,
      sceneRef: 'Scene 1',
      locationId: office._id,
    },
  },
  alice.ctx(),
);
console.log('  ✓ Sarah appears in Episode 1, Scene 1\n');

// Create timeline entries
console.log('📅 Creating timeline entries...');
await call(
  appRouter.knowledgeBase.timeline.create,
  {
    seriesId: aliceSeries._id,
    value: {
      label: "Sarah's sister disappears",
      order: 1,
      timestamp: '3 days before episode 1',
      links: [{ entityType: 'character', entityId: sarah._id }],
    },
  },
  alice.ctx(),
);
console.log("  ✓ Timeline: Sarah's sister disappears");

await call(
  appRouter.knowledgeBase.timeline.create,
  {
    seriesId: aliceSeries._id,
    value: {
      label: 'Sarah visits Morgan',
      order: 2,
      timestamp: 'Episode 1, Scene 1',
      links: [
        { entityType: 'character', entityId: sarah._id },
        { entityType: 'character', entityId: detective._id },
      ],
    },
  },
  alice.ctx(),
);
console.log('  ✓ Timeline: Sarah visits Morgan\n');

// Add wildcards (notes/world-building)
console.log('📝 Creating world-building notes...');
await call(
  appRouter.knowledgeBase.wildcards.create,
  {
    seriesId: aliceSeries._id,
    value: {
      title: 'City Setting',
      body: 'The story takes place in a noir-inspired city where rain never stops and shadows hide secrets.',
      tag: 'world-building',
    },
  },
  alice.ctx(),
);
console.log('  ✓ Note: City Setting');

await call(
  appRouter.knowledgeBase.wildcards.create,
  {
    seriesId: aliceSeries._id,
    value: {
      title: "Morgan's Backstory",
      body: 'Morgan left the force after a case went wrong. Now works as a private detective.',
      tag: 'character-background',
    },
  },
  alice.ctx(),
);
console.log("  ✓ Note: Morgan's Backstory\n");

// Add canvas nodes for story structure
console.log('🎨 Creating canvas visualization...');
await call(
  appRouter.canvas.upsertNodes,
  {
    seriesId: aliceSeries._id,
    nodes: [
      {
        _id: 'act1',
        seriesId: aliceSeries._id,
        type: 'text',
        content: 'ACT 1: The Setup\n- Sarah arrives\n- Case is presented',
        position: { x: 0, y: 0 },
      },
      {
        _id: 'act2',
        seriesId: aliceSeries._id,
        type: 'text',
        content: 'ACT 2: Investigation\n- Morgan investigates\n- Clues are found',
        position: { x: 300, y: 0 },
      },
      {
        _id: 'act3',
        seriesId: aliceSeries._id,
        type: 'text',
        content: 'ACT 3: Resolution\n- Mystery solved\n- Consequences revealed',
        position: { x: 600, y: 0 },
      },
    ],
  },
  alice.ctx(),
);

await call(
  appRouter.canvas.upsertEdges,
  {
    seriesId: aliceSeries._id,
    edges: [
      {
        _id: 'act1-2',
        seriesId: aliceSeries._id,
        sourceId: 'act1',
        targetId: 'act2',
        label: 'leads to',
      },
      {
        _id: 'act2-3',
        seriesId: aliceSeries._id,
        sourceId: 'act2',
        targetId: 'act3',
        label: 'resolves',
      },
    ],
  },
  alice.ctx(),
);
console.log('  ✓ Created story structure canvas\n');

// Create a second series for Bob
console.log('📚 Creating additional series...');
const bobSeries = await call(
  appRouter.series.createSeries,
  {
    title: 'Space Adventure',
    genre: 'Sci-Fi',
    logline: 'A crew of explorers discovers ancient alien artifacts',
  },
  bob.ctx(),
);
console.log(`  ✓ Series: ${bobSeries.title} (ID: ${bobSeries._id})`);

const bobScript = await call(
  appRouter.scripts.createScript,
  {
    seriesId: bobSeries._id,
    title: 'Pilot: First Contact',
    authors: ['Bob Collaborator'],
  },
  bob.ctx(),
);
console.log(`  ✓ Script: ${bobScript.title}\n`);

// Summary
console.log('✅ Mock data seeding complete!\n');
console.log('📊 Database Summary:');
console.log('  • 3 users (Alice, Bob, Charlie)');
console.log('  • 2 series (Detective Chronicles, Space Adventure)');
console.log('  • 3 scripts across both series');
console.log('  • 3 characters, 2 locations, 2 props');
console.log('  • Character relationships and appearances');
console.log('  • Timeline entries and world-building notes');
console.log('  • Canvas story structure\n');

console.log('🌐 Starting server...');
console.log(`   Server: http://localhost:${process.env.SERVER_PORT}`);
console.log(`   API:    http://localhost:${process.env.SERVER_PORT}/api`);
console.log(`   Docs:   http://localhost:${process.env.SERVER_PORT}/api/reference\n`);

console.log('🔑 Test Credentials:');
console.log('   Alice: alice@example.com / password123');
console.log('   Bob:   bob@example.com / password123');
console.log('   Charlie: charlie@example.com / password123\n');

console.log('💡 Tip: Use these credentials to authenticate and explore the API\n');

// Start the server
Bun.serve({
  fetch: app.fetch,
  port: Number.parseInt(process.env.SERVER_PORT || '3000', 10),
  hostname: process.env.SERVER_HOST || 'localhost',
});

console.log('✨ Server is ready! Press Ctrl+C to stop.\n');

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down...');
  await mongoose.disconnect();
  await mongo.stop({ doCleanup: true, force: true });
  console.log('✓ Clean shutdown complete');
  throw new Error('Process terminated by SIGINT');
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Shutting down...');
  await mongoose.disconnect();
  await mongo.stop({ doCleanup: true, force: true });
  console.log('✓ Clean shutdown complete');
  throw new Error('Process terminated by SIGTERM');
});
