/* eslint-disable max-classes-per-file */
import { prop } from '@typegoose/typegoose';

/**
 * Base class with required timestamps for Typegoose models.
 *
 * Unlike the default TimeStamps class from @typegoose/typegoose which makes
 * createdAt and updatedAt optional, this class makes them required to match
 * the actual behavior of Mongoose when timestamps: true is enabled.
 */
export class RequiredTimeStamps {
  public createdAt!: Date;

  public updatedAt!: Date;
}

/**
 * Base class for versioned KB entities.
 * Extends RequiredTimeStamps with version tracking fields for real-time sync.
 *
 * - _version: incremented on every save, used for optimistic concurrency and polling
 * - _lastModifiedBy: user ID who made the last modification
 * - _lastModifiedAt: timestamp of last user modification (separate from auto updatedAt)
 */
export class VersionedEntity extends RequiredTimeStamps {
  /** Version number, starts at 1 and increments on every save */
  @prop({ default: 1, index: true })
  public _version!: number;

  /** User ID who made the last modification */
  @prop()
  public _lastModifiedBy?: string;

  /** Timestamp of last modification (distinct from updatedAt for explicit tracking) */
  @prop()
  public _lastModifiedAt?: Date;
}
