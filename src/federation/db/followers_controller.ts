import { logger } from '../../util';
import { getCollection } from '../../db/mongo';
import config from 'config';
import { errorControllerHandler } from '../../errorHandlers';
import { ObjectId } from 'mongodb';

const collectionName = String(
  config.get('mongodb.collections.federation.followers')
);

export async function createFollower(
  actor: string,
  uri: string,
  userResource: UserResource
): Promise<void> {
  try {
    const collection = await getCollection(collectionName);
    const pwyllUser: PwyllUser = {
      _id: userResource.pwyllUserId,
      username: userResource.username,
    };
    const follower: Follower = {
      actor,
      uri,
      createdAt: new Date().toISOString(),
      pwyllUser,
    };
    const insertResult = await collection.updateOne(
      {
        actor: actor,
        pwyllUser: pwyllUser,
      },
      { $set: follower },
      { upsert: true }
    );
    logger.debug('Inserted documents =>', insertResult);
  } catch (error) {
    // TODO: check this error handler, maybe too much pwyll oriented for fedi
    errorControllerHandler(error);
  }
}

/**
 * Returns the followers of a Pwyll user
 * @param userId
 * @returns array of Followers or undefined
 */
export async function getFollowers(
  userId: ObjectId
): Promise<Follower[] | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const results = await collection
      .find({
        'pwyllUser._id': userId,
      })
      .toArray();
    const followers: Follower[] = [];
    if (results != null) {
      for (const result of results) {
        const follower: Follower = {
          actor: result.actor,
          uri: result.uri,
          createdAt: result.createdAt,
        };
        followers.push(follower);
      }
    }
    return followers;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function unFollower(
  actor: string,
  userResource: UserResource
): Promise<void> {
  try {
    const collection = await getCollection(collectionName);
    const pwyllUser: PwyllUser = {
      _id: userResource.pwyllUserId,
      username: userResource.username,
    };
    const deleteResult = await collection.deleteOne({
      actor: actor,
      pwyllUser: pwyllUser,
    });
    logger.debug('Deleted follower =>', deleteResult);
  } catch (error) {
    errorControllerHandler(error);
  }
}
