import { logger } from './../util';
import { getCollection } from './../db/mongo';
import { MongoError, ObjectId } from 'mongodb';
import config from 'config';

const collectionName = String(config.get('mongodb.collections.users'));

//XXX: mongo it's returning a sequental ID, this is not the best
//approach... maybe add a password or give a generated uuid
export async function createUser(
  username: string
): Promise<ObjectId | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const user: User = {
      username: username,
    };
    const insertResult = await collection.insertOne(user);
    logger.debug('Inserted user =>', insertResult);
    const id: ObjectId = insertResult.insertedId;
    return id;
  } catch (error) {
    if (error instanceof MongoError) {
      throw new Error(error.message);
    }
  }
}

export async function findUserById(id: string): Promise<User | undefined> {
  try {
    logger.debug('01');
    const collection = await getCollection(collectionName);
    logger.debug('02');

    logger.debug(`try to find user with id: ${id}`);
    const objectId = new ObjectId(id);
    const result = await collection.findOne({ _id: objectId });
    logger.debug('03');

    if (result != null) {
      const user: User = {
        username: result.username,
        _id: result._id,
      };
      return Promise.resolve(user);
    } else {
      return Promise.resolve(undefined);
    }
  } catch (error) {
    logger.error(error);
    if (error instanceof MongoError) {
      throw new Error(error.message);
    }
  }
}

export async function findUserByName(
  username: string
): Promise<User | undefined> {
  try {
    const collection = await getCollection(collectionName);
    logger.debug(`try to find username: ${username}`);
    const result = await collection.findOne({ username: username });
    if (result != null) {
      const user: User = {
        username: result.username,
      };
      return Promise.resolve(user);
    } else {
      return Promise.resolve(undefined);
    }
  } catch (error) {
    logger.error(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}
