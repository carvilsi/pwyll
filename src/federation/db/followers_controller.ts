import { logger } from '../../util';
import { getCollection } from '../../db/mongo';
import config from 'config';
import { errorControllerHandler } from '../../errorHandlers';

const collectionName = String(
    config.get('mongodb.collections.federation.followers'));

export async function createFollower(
  actor: string,
  uri: string
): Promise<void> {
  try {
    
    const collection = await getCollection(collectionName);
    const follower: Follower = {
      actor,
      uri,
      createdAt: new Date().toISOString(),
    };
    const insertResult = await collection.updateOne(
      { actor: actor },
      { $set: follower },
      { upsert: true }
    );
    logger.debug('Inserted documents =>', insertResult);
  } catch (error) {
    // TODO: check this error handler, maybe too much pwyll oriented for fedi
    errorControllerHandler(error);
  }
}

export async function getFollowers(): Promise<Follower[] | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const results = await collection.find().toArray();
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

export async function unFollower(actor: string): Promise<void> {
  try {
    const collection = await getCollection(collectionName);
    const deleteResult = await collection.deleteOne({ actor: actor });
    logger.debug('Deleted follower =>', deleteResult);
  } catch (error) {
    errorControllerHandler(error);
  }
}
