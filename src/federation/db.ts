import { logger } from '../util';
import { getCollection } from '../db/mongo';
import config from 'config';
import _ from 'lodash';
import { errorControllerHandler } from '../errorHandlers';
import { ObjectId } from 'mongodb';

type Follower = {
    actor: string,
    uri: string,
    createdAt: string,
}

export async function createFollower(
  actor: string,
  uri: string,
): Promise<void> {
  try {
    const collectionName = String(config.get('mongodb.collections.federation.followers'));
    const collection = await getCollection(collectionName);
    const follower: Follower = {
      actor,
      uri,
      createdAt: new Date().toISOString(),
    };
    const insertResult = await collection.insertOne(follower);
    logger.debug('Inserted documents =>', insertResult);
    // const id: ObjectId = insertResult.insertedId;
  } catch (error) {
    errorControllerHandler(error);
  }
}