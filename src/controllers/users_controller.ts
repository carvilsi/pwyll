import { logger } from './../util';
import { UserIdentityError, errorControllerHandler } from '../errorHandlers';
import { getArgon2Hash, validateArgon2Hash } from '../util/security';
import * as db from '../db/';
import { userCreate, userFindById, userFindByName } from '../db/queries';

export async function createUser(
  username: string,
  secret: string
): Promise<Number | undefined> {
  try {
    const hash = await getArgon2Hash(secret);
    const res = await db.query(userCreate, [username, hash]);
    logger.debug('Inserted user =>', res.rows[0]);
    return res.rows[0].id as unknown as Number;
  } catch (error) {
    errorControllerHandler(error);
  }
}

export async function findUserByID(
  userID: string,
  secret?: string
): Promise<User | undefined> {
  try {
    logger.debug(`try to find user with id: ${userID}`);

    const result = await db.query(userFindById, [userID]);

    if (result.rows.length) {
      const row = result.rows[0];
      const user: User = {
        username: row.username,
        _id: row.id,
      };

      if (typeof secret !== 'undefined') {
        const valid = await validateArgon2Hash(row.secret, secret);
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
    logger.debug(`try to find username: ${username}`);

    const result = await db.query(userFindByName, [username]);
    if (result.rows.length) {
      const user: User = {
        username,
      };
      return user;
    } else {
      return undefined;
    }
  } catch (error) {
    errorControllerHandler(error);
  }
}
