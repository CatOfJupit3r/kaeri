import { inject, singleton } from 'tsyringe';

import { DatabaseService } from '@~/db/database.service';
import { TOKENS } from '@~/di/tokens';
import type { iWithLogger, LoggerFactory } from '@~/features/logger/logger.types';

interface iAuthUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Service for looking up users from Better Auth's user collection.
 * Better Auth manages the 'user' collection directly, so we query it via raw MongoDB.
 */
@singleton()
export class AuthUserLookupService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.DatabaseService) private readonly databaseService: DatabaseService,
  ) {
    this.logger = loggerFactory.create('auth-user-lookup-service');
  }

  /**
   * Get a user by ID.
   */
  public async getUserById(userId: string): Promise<iAuthUser | null> {
    const db = this.databaseService.getClient();
    const userCollection = db.collection('user');
    const user = await userCollection.findOne({ id: userId });

    if (!user) {
      return null;
    }

    return {
      id: user.id as string,
      name: (user.name as string) || 'Unknown User',
      email: (user.email as string) || '',
    };
  }

  /**
   * Get multiple users by their IDs.
   */
  public async getUsersByIds(userIds: string[]): Promise<Map<string, iAuthUser>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const db = this.databaseService.getClient();
    const userCollection = db.collection('user');
    const users = await userCollection.find({ id: { $in: userIds } }).toArray();

    const userMap = new Map<string, iAuthUser>();
    for (const user of users) {
      userMap.set(user.id as string, {
        id: user.id as string,
        name: (user.name as string) || 'Unknown User',
        email: (user.email as string) || '',
      });
    }

    return userMap;
  }

  /**
   * Check if a user with the given email exists.
   */
  public async userExistsByEmail(email: string): Promise<boolean> {
    const db = this.databaseService.getClient();
    const userCollection = db.collection('user');
    const user = await userCollection.findOne({ email: email.toLowerCase() });
    return user !== null;
  }

  /**
   * Get a user by email.
   */
  public async getUserByEmail(email: string): Promise<iAuthUser | null> {
    const db = this.databaseService.getClient();
    const userCollection = db.collection('user');
    const user = await userCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return null;
    }

    return {
      id: user.id as string,
      name: (user.name as string) || 'Unknown User',
      email: (user.email as string) || '',
    };
  }
}
