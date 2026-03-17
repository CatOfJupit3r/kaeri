/**
 * Migration: Create personal workspaces for existing users
 *
 * This migration finds all users who don't have a personal workspace
 * and creates one for them with OWNER role membership.
 *
 * Run with: bunx tsx apps/server/src/db/migrations/create-personal-workspaces.ts
 */
import mongoose from 'mongoose';

import { WORKSPACE_ROLES } from '@kaeri/shared';

import env from '@~/constants/env';
import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { WorkspaceModel } from '@~/db/models/workspace.model';

interface iUser {
  _id: string;
  name: string;
  email: string;
}

async function connectToDatabase() {
  await mongoose.connect(env.MONGO_URI, {
    dbName: env.MONGO_DATABASE_NAME,
    auth: {
      username: env.MONGO_USER,
      password: env.MONGO_PASSWORD,
    },
  });
  console.log('Connected to database');
}

async function hasPersonalWorkspace(userId: string): Promise<boolean> {
  // Check by creatorId
  const byCreator = await WorkspaceModel.findOne({
    isPersonal: true,
    creatorId: userId,
  });

  if (byCreator) return true;

  // Check by ownership membership
  const memberships = await WorkspaceMemberModel.find({
    userId,
    role: WORKSPACE_ROLES.OWNER,
  }).lean();

  /* eslint-disable no-await-in-loop */
  for (const membership of memberships) {
    const workspace = await WorkspaceModel.findOne({
      _id: membership.workspaceId,
      isPersonal: true,
    });
    if (workspace) return true;
  }
  /* eslint-enable no-await-in-loop */

  return false;
}

async function createPersonalWorkspacesForUsers() {
  const { db } = mongoose.connection;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const userCollection = db.collection('user');

  // Get all users
  const users = (await userCollection.find({}).toArray()) as unknown as iUser[];

  console.log(`Found ${users.length} total users`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  /* eslint-disable no-await-in-loop */
  for (const user of users) {
    try {
      const { _id: userId, name: userName } = user;
      // Check if user already has a personal workspace
      const hasWorkspace = await hasPersonalWorkspace(userId);

      if (hasWorkspace) {
        skipped += 1;
        // eslint-disable-next-line no-continue
        continue;
      }

      // Create personal workspace
      const workspace = await WorkspaceModel.create({
        name: `${userName}'s Workspace`,
        isPersonal: true,
        creatorId: userId,
      });

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId,
        role: WORKSPACE_ROLES.OWNER,
        joinedAt: new Date(),
      });

      console.log(`Created personal workspace for user ${userName} (${userId}): ${workspace._id}`);
      created += 1;
    } catch (error) {
      console.error(`Failed to create workspace for user ${user._id}:`, error);
      errors += 1;
    }
  }
  /* eslint-enable no-await-in-loop */

  console.log(`\nMigration complete: ${created} created, ${skipped} skipped (already had workspace), ${errors} errors`);
}

async function main() {
  try {
    await connectToDatabase();
    await createPersonalWorkspacesForUsers();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

main().catch(console.error);
