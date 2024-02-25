import { logger } from '../util';
import { getCollection } from '../db/mongo';
import { ObjectId } from 'mongodb';
import config from 'config';
import { findUserByID } from './users_controller';
import _ from 'lodash';
import { errorControllerHandler } from '../errorHandlers';

const collectionName = String(config.get('mongodb.collections.snippets'));
const limitFind = Number(config.get('mongodb.limit'));

export async function createSnippet(
  snippet: string,
  description: string,
  userID: string,
  secret: string
): Promise<ObjectId | undefined> {
  try {
    const collection = await getCollection(collectionName);
    const user = await findUserByID(userID, secret);
    const command: Snippet = {
      snippet: snippet,
      description: description,
      user: user,
    };
    const insertResult = await collection.insertOne(command);
    logger.debug('Inserted documents =>', insertResult);
    const id: ObjectId = insertResult.insertedId;
    return id;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function findSnippetByQuery(
  search: string,
  userID?: string
): Promise<Snippet[] | undefined> {
  try {
    const collection = await getCollection(collectionName);
    logger.debug(
      `try to find snippets for: ${search} and for user: ${userID!}`
    );
    let user;
    if (userID != null) {
      user = await findUserByID(userID);
    }
    const regExp = new RegExp(`${search}`, 'im');
    let mongoQuery;
    if (user != null) {
      mongoQuery = {
        $or: [
          { snippet: { $regex: regExp } },
          { description: { $regex: regExp } },
        ],
        $and: [{ user: user }],
      };
    } else {
      mongoQuery = {
        $or: [
          { snippet: { $regex: regExp } },
          { description: { $regex: regExp } },
        ],
      };
    }
    const results = await collection?.find(mongoQuery)
      .limit(limitFind)
      .toArray();
    const snippets: Snippet[] = [];
    if (results != null) {
      for (const result of results) {
      const snippet: Snippet = {
        snippet: result.snippet,
        description: result.description,
        _id: result._id,
        username: result.user.username,
      };
      snippets.push(snippet);
    }
    }
    return snippets;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function findSnippetByID(
  snippetID: string
): Promise<Snippet | string | undefined> {
  try {
    if (snippetID != null) {
      const collection = await getCollection(collectionName);
      logger.debug(`try to find commands with id: ${snippetID}`);
      const objectId = new ObjectId(snippetID);
      const result = await collection?.findOne({ _id: objectId });
      if (result != null) {
        const snippet: Snippet = {
          snippet: result.snippet,
          description: result.description,
          _id: result._id,
          user: result.user,
        };
        return snippet;
      } else {
        throw new Error(`snippet not found for ${snippetID}`);
      }
    } else {
      throw new Error('bad request');
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function deleteSnippetByID(
  snippetID: string,
  userID: string,
  secret: string
): Promise<boolean | undefined> {
  try {
    const collection = await getCollection(collectionName);
    if (snippetID != null && userID != null && secret != null) {
      const user = await findUserByID(userID, secret);
      const command = await findSnippetByID(snippetID);
      if (command != null) {
        if (typeof command === 'string')
          throw new Error('Command not found for deleting command');
        if (
          !_.isEqual(command.user!._id, user?._id) ||
          command.user!.username !== user?.username
        ) {
          throw new Error('Wrong user provided for deleting snippet');
        }
      }
      const objectId = new ObjectId(snippetID);
      const result = await collection?.deleteOne({ _id: objectId });
      if (result != null) {
        if (result.acknowledged && result.deletedCount === 1) return true;
      } else {
        return false;
      }
    } else {
      throw new Error('bad request');
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function updateSnippet(
  snippetUpdate: string,
  descriptionUpdate: string,
  id: string,
  userID: string,
  secret: string
): Promise<boolean | undefined> {
  try {
    const collection = await getCollection(collectionName);
    if (
      id != null &&
      userID != null &&
      snippetUpdate != null &&
      descriptionUpdate != null &&
      secret != null
    ) {
      const user = await findUserByID(userID, secret);
      if (user == null)
        throw new Error('User does not exist for updating snippet');
      const snippetFound = await findSnippetByID(id);
      if (snippetFound != null) {
        if (typeof snippetFound === 'string')
          throw new Error('Command not found for updating snippet');
        if (
          !_.isEqual(snippetFound.user!._id, user._id) ||
          snippetFound.user!.username !== user.username
        ) {
          throw new Error('Wrong user provided for deleting snippet');
        }
      }
      const objectId = new ObjectId(id);
      const snippet: Snippet = {
        snippet: snippetUpdate,
        description: descriptionUpdate,
      };
      const result = await collection.updateOne({ _id: objectId }, [
        { $set: snippet },
      ]);
      if (result != null) {
        if (result.acknowledged && result.matchedCount === 1) return true;
      } else {
        return false;
      }
    } else {
      throw new Error('bad request');
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}
