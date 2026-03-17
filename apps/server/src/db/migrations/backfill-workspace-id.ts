/**
 * Migration: Backfill workspaceId for existing series
 *
 * This migration finds all series without a workspaceId and assigns them to
 * the creator's personal workspace. If the creator doesn't have a personal
 * workspace, one is created.
 *
 * Run with: bunx tsx apps/server/src/db/migrations/backfill-workspace-id.ts
 */
import mongoose from 'mongoose';

import { WORKSPACE_ROLES } from '@kaeri/shared';

import env from '@~/constants/env';
import { SeriesModel } from '@~/db/models/series.model';
import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { WorkspaceModel } from '@~/db/models/workspace.model';

interface iLegacySeries {
  _id: string;
  title: string;
  creatorId?: string;
  workspaceId?: string;
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

async function getOrCreatePersonalWorkspace(userId: string, userName: string): Promise<string> {
  // Check if user already has a personal workspace
  let workspace = await WorkspaceModel.findOne({
    isPersonal: true,
    creatorId: userId,
  });

  if (workspace) {
    return workspace._id;
  }

  // Check via workspace membership as fallback
  const membership = await WorkspaceMemberModel.findOne({
    userId,
    role: WORKSPACE_ROLES.OWNER,
  }).lean();

  if (membership) {
    workspace = await WorkspaceModel.findOne({
      _id: membership.workspaceId,
      isPersonal: true,
    });

    if (workspace) {
      // Fix the creatorId if missing
      if (!workspace.creatorId) {
        await WorkspaceModel.updateOne({ _id: workspace._id }, { creatorId: userId });
      }
      return workspace._id;
    }
  }

  // Create new personal workspace
  workspace = await WorkspaceModel.create({
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

  console.log(`Created personal workspace for user ${userId}: ${workspace._id}`);
  return workspace._id;
}

async function backfillWorkspaceIds() {
  // Find all series without workspaceId
  // Using raw mongoose to handle potentially missing fields
  const { db } = mongoose.connection;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const seriesCollection = db.collection('series');
  const userCollection = db.collection('user');

  // Find series without workspaceId or with null workspaceId
  const seriesWithoutWorkspace = (await seriesCollection
    .find({
      $or: [{ workspaceId: { $exists: false } }, { workspaceId: null }, { workspaceId: '' }],
    })
    .toArray()) as unknown as iLegacySeries[];

  console.log(`Found ${seriesWithoutWorkspace.length} series without workspaceId`);

  if (seriesWithoutWorkspace.length === 0) {
    console.log('No series need migration');
    return;
  }

  let migrated = 0;
  let errors = 0;

  /* eslint-disable no-await-in-loop */
  for (const series of seriesWithoutWorkspace) {
    try {
      // Get or create user's personal workspace
      // If series has creatorId, use that; otherwise try to find the owner
      const { creatorId: userId, _id: seriesId, title } = series;
      let resolvedUserId = userId;
      let userName = 'Unknown User';

      if (!resolvedUserId) {
        // For very old series without creatorId, assign to first admin/owner
        const firstUser = await userCollection.findOne({});
        if (firstUser) {
          resolvedUserId = String(firstUser._id);
          userName = (firstUser.name as string) || 'Unknown User';
          console.log(`Series ${seriesId} (${title}) has no creatorId, assigning to first user: ${userName}`);
        } else {
          console.error(`Series ${seriesId} has no creatorId and no users exist`);
          errors += 1;
          // eslint-disable-next-line no-continue
          continue;
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await userCollection.findOne({ _id: resolvedUserId } as any);
        userName = (user?.name as string) || 'Unknown User';
      }

      const workspaceId = await getOrCreatePersonalWorkspace(resolvedUserId, userName);

      // Update series with workspaceId
      await SeriesModel.updateOne({ _id: seriesId }, { workspaceId });

      console.log(`Migrated series ${seriesId} (${title}) to workspace ${workspaceId}`);
      migrated += 1;
    } catch (error) {
      console.error(`Failed to migrate series ${series._id}:`, error);
      errors += 1;
    }
  }
  /* eslint-enable no-await-in-loop */

  console.log(`\nMigration complete: ${migrated} migrated, ${errors} errors`);
}

async function main() {
  try {
    await connectToDatabase();
    await backfillWorkspaceIds();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

main().catch(console.error);
