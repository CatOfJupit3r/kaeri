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
