import { logger } from './../util';
import { getCollection } from './../db/mongo';
import { MongoError, ObjectId } from 'mongodb';
import config from 'config';
import { findUserById } from './users_controller';
import _ from 'lodash';

const collectionName = String(config.get('mongodb.collections.commands'));
const limitFind = Number(config.get('mongodb.limit'));

export async function createCommand(
  comm: string,
  description: string,
  userId: string
): Promise<ObjectId | undefined> {
  try {
    const collection = await getCollection(collectionName);
    if (userId != null) {
      const user = await findUserById(userId);
      if (user != null) {
        const command: Command = {
          command: comm,
          description: description,
          user: user,
        };
        const insertResult = await collection.insertOne(command);
        logger.debug('Inserted documents =>', insertResult);
        const id: ObjectId = insertResult.insertedId;
        return Promise.resolve(id);
      } else {
        throw new Error(
          'Not possible to store a command for a non exiting user'
        );
      }
    } else {
      throw new Error('userId must be provided');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

export async function findCommandByQuery(
  search: string,
  userId?: string
): Promise<Command[] | undefined> {
  try {
    const collection = await getCollection(collectionName);
    logger.debug(
      `try to find commands for: ${search} and for user: ${userId!}`
    );
    let user;
    if (userId != null) {
      user = await findUserById(userId);
      if (user == null) throw new Error('Any commands for provided user');
    }
    const regExp = new RegExp(`${search}`, 'im');
    let mongoQuery;
    if (user != null) {
      mongoQuery = {
        $or: [
          { command: { $regex: regExp } },
          { description: { $regex: regExp } },
        ],
        $and: [{ user: user }],
      };
    } else {
      mongoQuery = {
        $or: [
          { command: { $regex: regExp } },
          { description: { $regex: regExp } },
        ],
      };
    }
    const results = await collection
      .find(mongoQuery)
      .limit(limitFind)
      .toArray();
    const commands: Command[] = [];
    for (const result of results) {
      const command: Command = {
        command: result.command,
        description: result.description,
        _id: result._id,
        username: result.user.username,
      };
      commands.push(command);
    }
    return commands;
  } catch (error) {
    if (error instanceof MongoError || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

async function _findCommandById(
  id: string
): Promise<Command | string | undefined> {
  try {
    const collection = await getCollection(collectionName);
    logger.debug(`try to find commands with id: ${id}`);
    const objectId = new ObjectId(id);
    const result = await collection.findOne({ _id: objectId });
    if (result != null) {
      const command: Command = {
        command: result.command,
        description: result.description,
        _id: result._id,
        user: result.user,
      };
      return Promise.resolve(command);
    } else {
      return Promise.resolve(`command not found for ${id}`);
    }
  } catch (error) {
    logger.error(error);
    if (error instanceof Error) {
      if (
        /Argument passed in must be a string of 12 bytes or a string of 24 hex characters/.test(
          error.message
        )
      ) {
        throw new Error('Command not found for deleting');
      } else {
        throw new Error(error.message);
      }
    }
  }
}

export async function deleteCommandById(
  id: string,
  userId: string
): Promise<boolean | undefined> {
  try {
    const collection = await getCollection(collectionName);
    if (id != null && userId != null) {
      const user = await findUserById(userId);
      if (user == null)
        throw new Error('User does not exist for deleting command');
      const command = await _findCommandById(id);
      if (command != null) {
        if (typeof command === 'string')
          throw new Error('Command not found for deleting command');
        if (
          !_.isEqual(command.user!._id, user._id) ||
          command.user!.username !== user.username
        ) {
          throw new Error('Wrong user provided for deleting command');
        }
      }
      const objectId = new ObjectId(id);
      const result = await collection.deleteOne({ _id: objectId });
      if (result != null) {
        if (result.acknowledged && result.deletedCount === 1)
          return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    } else {
      throw new Error('bad request');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

export async function updatesCommand(
  commandUpdate: string,
  descriptionUpdate: string,
  id: string,
  userId: string
): Promise<boolean | undefined> {
  try {
    const collection = await getCollection(collectionName);
    if (
      id != null &&
      userId != null &&
      commandUpdate != null &&
      descriptionUpdate != null
    ) {
      const user = await findUserById(userId);
      if (user == null)
        throw new Error('User does not exist for updating command');
      const commandFound = await _findCommandById(id);
      if (commandFound != null) {
        if (typeof commandFound === 'string')
          throw new Error('Command not found for updating command');
        if (
          !_.isEqual(commandFound.user!._id, user._id) ||
          commandFound.user!.username !== user.username
        ) {
          throw new Error('Wrong user provided for deleting command');
        }
      }
      const objectId = new ObjectId(id);
      const command: Command = {
        command: commandUpdate,
        description: descriptionUpdate,
      };
      const result = await collection.updateOne({ _id: objectId }, [
        { $set: command },
      ]);
      if (result != null) {
        if (result.acknowledged && result.matchedCount === 1)
          return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    } else {
      throw new Error('bad request');
    }
  } catch (error) {
    if (error instanceof MongoError || error instanceof Error) {
      throw new Error(error.message);
    }
  }
}
