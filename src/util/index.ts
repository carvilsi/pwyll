import { findUserByName } from '../controllers/users_controller';

const Logger = require('logplease');
export const info = require('./../../package.json');
import config from 'config';

const logLevel = config.get('logLevel');
const forbiddenUserNames: string[] = config.get('forbiddenUserNames');

Logger.setLogLevel(logLevel);
export const logger = Logger.create(`${info.name}`);

export function userLengthCheck(username: string): boolean {
  if (!username.trim().length) throw 'Provide a user name';
  if (username.length > 20)
    throw 'Username must be not longer than 20 characters';
  return true;
}

export function forbiddenNameCheck(username: string): boolean {
  if (forbiddenUserNames.includes(username.toLocaleLowerCase()))
    throw `${username} is a forbidden name, please choose a different`;
  return true;
}

export async function userExistenceCheck(username: string): Promise<boolean> {
  const user = await findUserByName(username);
  if (user != null)
    throw `User ${username} already exists, please choose a different one`;
  return true;
}
