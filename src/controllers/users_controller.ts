import { logger } from './../util';
import { getCollection } from './../db/mongo';
import { ObjectId } from 'mongodb';
import config from 'config';
import { UserIdentityError, errorControllerHandler } from '../errorHandlers';
import { getArgon2Hash, validateArgon2Hash } from '../util/security';

const collectionName = String(config.get('mongodb.collections.users'));

export async function createUser(
  username: string,
  secret: string
): Promise<ObjectId | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const user: User = {
      username: username,
      secret: await getArgon2Hash(secret),
    };
    const insertResult = await collection.insertOne(user);
    logger.debug('Inserted user =>', insertResult);
    const id: ObjectId = insertResult.insertedId;
    return id;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function getUsers(): Promise<User[] | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const users: User[] = [];
    const results = await collection.find().toArray();
    for (const result of results) {
      const user: User = {
        username: result.username,
        _id: result._id,
      };
      users.push(user);
    }
    return users;
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

    const result = await collection.findOne(userQuery);

    if (result != null) {
      const user: User = {
        username: result.username,
        _id: result._id,
      };

      if (typeof secret !== 'undefined') {
        const valid = await validateArgon2Hash(result.secret, secret);
        if (!valid) throw new UserIdentityError('Invalid userID or secret');
      }

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
