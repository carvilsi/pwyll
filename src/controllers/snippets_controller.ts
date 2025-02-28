import { logger } from '../util';
import config from 'config';
import { findUserByID } from './users_controller';
import _ from 'lodash';
import { errorControllerHandler } from '../errorHandlers';
import * as db from '../db/';
import {
  snippetCreate,
  snippetDelete,
  snippetFindAnyUser,
  snippetFindById,
  snippetFindForUser,
} from '../db/queries';

const limitFind = Number(config.get('postgresql.limit'));

export async function createSnippet(
  snippet: string,
  description: string,
  userID: string,
  secret: string
): Promise<Number | undefined> {
  try {
    const user = await findUserByID(userID, secret);
    const result = await db.query(snippetCreate, [
      snippet,
      description,
      user?._id,
    ]);
    logger.debug('Inserted documents =>', result.rows[0]);
    return result.rows[0].id as unknown as Number;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function findSnippetByQuery(
  search: string,
  userID?: string
): Promise<Snippet[] | undefined> {
  try {
    logger.debug(
      `try to find snippets for: ${search} and for user: ${userID!}`
    );

    let user;
    let results;

    const q = search.trim().split(/\s+/).join(':* & ').concat(':*');

    if (userID != null) {
      user = await findUserByID(userID);
      results = await db.query(snippetFindForUser, [q, user?._id, limitFind]);
    } else {
      results = await db.query(snippetFindAnyUser, [q, limitFind]);
    }

    const snippets: Snippet[] = [];
    if (results != null) {
      for (const result of results.rows) {
        const snippet: Snippet = {
          snippet: result.command,
          description: result.description,
          _id: result.id,
          username: result.username,
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
      logger.debug(`try to find commands with id: ${snippetID}`);
      const results = await db.query(snippetFindById, [snippetID]);
      if (results.rows.length) {
        const result = results.rows[0];
        const user: User = {
          username: result.username,
          _id: result.userId,
        };
        const snippet: Snippet = {
          snippet: result.command,
          description: result.description,
          _id: result.id,
          user,
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
      const result = await db.query(snippetDelete, [snippetID]);
      if (
        result != null &&
        result.rowCount === 1 &&
        result.command === 'DELETE'
      ) {
        return true;
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
      const result = await db.query(snippetUpdate, [
        snippetUpdate,
        descriptionUpdate,
        id,
      ]);
      if (
        result != null &&
        result.rowCount === 1 &&
        result.command === 'UPDATE'
      ) {
        return true;
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
