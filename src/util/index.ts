import { findUserByName } from '../controllers/users_controller';
import { getSaltOrCreateOne } from '../controllers/sec_controller';
import express from 'express';
import { createHash, randomBytes } from 'node:crypto';

const Logger = require('logplease');
export const info = require('./../../package.json');
import config from 'config';
const logLevel = config.get('logLevel');
const pepper = config.get('pepper');
Logger.setLogLevel(logLevel);
export const logger = Logger.create(`${info.name}`);

// check if the mandatory parameters are comming
// from request depending on check value:
// body (default), params, query
export function paramCheck(
  req: express.Request,
  mandatoryParams: Array<string>,
  { check = 'body' }: { check?: string } = {}
): void {
  for (const mandatoryParam of mandatoryParams) {
    const errMessage = `bad request for endpoint, mandatory: ${mandatoryParam}`;
    switch (check) {
      case 'body':
        if (req.body[mandatoryParam] == null) throw errMessage;
        break;
      case 'params':
        if (req.params[mandatoryParam] == null) throw errMessage;
        break;
      case 'query':
        if (req.query[mandatoryParam] == null) throw errMessage;
        break;
      default:
        break;
    }
  }
}

export function userLengthCheck(username: string): boolean {
  if (!username.trim().length) throw 'Provide a user name';
  if (username.length > 20)
    throw 'Username must be not longer than 20 characters';
  return true;
}

export function secretLengthCheck(secret: string): boolean {
  if (!secret.trim().length) throw 'Provide a secret';
  return true;
}

export async function userExistenceCheck(username: string): Promise<boolean> {
  const user = await findUserByName(username);
  if (user != null)
    throw `User ${username} already exists, please choose a different one`;
  return true;
}

export async function getHash(secret: string): Promise<string> {
  const hash = createHash('sha3-512');
  const salt = await getSaltOrCreateOne();
  hash.update(`${salt}${secret}${pepper}`);
  return hash.digest('hex');
}

export function generateSalt(): string {
  return randomBytes(40).toString('base64');
}
