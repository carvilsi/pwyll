import { logger, generateSalt } from './../util';
import { getCollection } from './../db/mongo';
import config from 'config';
import { errorControllerHandler } from '../errorHandlers';

const collectionName = String(config.get('mongodb.collections.security'));

async function createSalt(): Promise<string | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const salt = generateSalt();
    const secSalt: Salt = {
      value: salt,
    };
    await collection.insertOne(secSalt);
    logger.debug('salt created, happy dressing');
    return salt;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function getSaltOrCreateOne(): Promise<string | undefined> {
  try {
    const collection = await getCollection(collectionName);

    logger.debug('try to find the salt');
    const result = await collection.findOne();

    if (result != null) {
      const salt: Salt = {
        value: result.value,
      };
      return salt.value;
    } else {
      return await createSalt();
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}
