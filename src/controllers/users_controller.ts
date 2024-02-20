import { logger, getHash } from './../util';
import { getCollection } from './../db/mongo';
import { ObjectId } from 'mongodb';
import config from 'config';
import { UserIdentityError, errorControllerHandler } from '../errorHandlers';

const collectionName = String(config.get('mongodb.collections.users'));

//XXX: mongo it's returning a sequental ID, this is not the best
//approach... maybe add a password or give a generated uuid
export async function createUser(
  username: string,
  secret: string
): Promise<ObjectId | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const user: User = {
      username: username,
      secret: getHash(secret),
    };
    const insertResult = await collection.insertOne(user);
    logger.debug('Inserted user =>', insertResult);
    const id: ObjectId = insertResult.insertedId;
    return id;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function findUserByID(
  userID: string,
  secret?: string
): Promise<User | undefined> {
  try {
    const collection = await getCollection(collectionName);

    logger.debug(`try to find user with id: ${userID}`);
    const objectId = new ObjectId(userID);
    const userQuery: QueryUser = {
      _id: objectId,
    };
    if (typeof secret !== 'undefined') userQuery.secret = getHash(secret);
    const result = await collection.findOne(userQuery);

    if (result != null) {
      const user: User = {
        username: result.username,
        _id: result._id,
      };
      return user;
    } else {
      throw new UserIdentityError('Invalid userID or secret');
    }
  } catch (error) {
    errorControllerHandler(error);
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
      return user;
    } else {
      return undefined;
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}
