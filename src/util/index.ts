const Logger = require('logplease');

export const info = require('./../../package.json');

import config from 'config';
import { findUserByName } from '../controllers/users_controller';

const logLevel = config.get('logLevel');

Logger.setLogLevel(logLevel);
export const logger = Logger.create(`${info.name}`);

export function paramCheck(
  param: any,
  mandatoryParams: Array<string>
): boolean {
  for (const mandatoryParam of mandatoryParams) {
    if (param[mandatoryParam] == null) {
      throw `bad request for endpoint, mandatory: ${mandatoryParam}`;
    }
  }
  return true;
}

export function userLengthCheck(username: string): boolean {
  if (!username.trim().length) throw 'Provide a user name';
  if (username.length > 20)
    throw 'Username must be not longer than 20 characters';
  return true;
}

export async function userExistenceCheck(username: string): Promise<boolean> {
  const user = await findUserByName(username);
  if (user != null)
    throw `User ${username} already exists, please choose a different`;
  return true;
}
