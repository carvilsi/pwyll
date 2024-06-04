import { findUserByName } from '../controllers/users_controller';
import express from 'express';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';

const Logger = require('logplease');
export const info = require('./../../package.json');
import config from 'config';
import { UserIdentityError } from '../errorHandlers';

const logLevel = config.get('logLevel');
const forbiddenUserNames: string[] = config.get('forbiddenUserNames');

Logger.setLogLevel(logLevel);
export const logger = Logger.create(`${info.name}`);

// this extra value will be stored in the hash of argon2
const PEPPER: string = process.env.PEPPER_VALUE || config.get('security.pepper');
const ASSOCIATED_DATA_ARGON2 = Buffer.from(randomBytes(64));
const ARGON2_TIME_COST = Number(
  process.env.ARGON2_TIME_COST || config.get('security.argon2TimeCost')
);
const ARGON2_PARALLELISM = Number(
  process.env.ARGON2_PARALLELISM || config.get('security.argon2Parallelism')
);

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

// TODO: add a minimun length
// TODO: maybe also a strength checker
export function secretLengthCheck(secret: string): boolean {
  if (!secret.trim().length) throw 'Provide a secret';
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

export async function getArgon2Hash(secret: string): Promise<string> {
  return await argon2.hash(secret, {
    secret: Buffer.from(PEPPER),
    associatedData: ASSOCIATED_DATA_ARGON2,
    timeCost: ARGON2_TIME_COST,
    parallelism: ARGON2_PARALLELISM,
  });
}

export async function validateArgon2Hash(
  hashedSecret: string,
  password: string
): Promise<boolean> {
  if (typeof hashedSecret === 'undefined')
    throw new Error('Missing hashed secret for user on DB');
  const valid = await argon2.verify(hashedSecret, password, {
    secret: Buffer.from(PEPPER),
  });
  if (!valid) throw new UserIdentityError('Invalid userID or secret');
  return valid;
}
