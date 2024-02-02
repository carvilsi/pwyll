const Logger = require('logplease');

export const info = require('./../../package.json');

import config from 'config';
import { findUserByName } from '../controllers/users_controller';
import express from 'express';

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
    throw `User ${username} already exists, please choose a different one`;
  return true;
}

export function errorRequestHandler(
  err: express.ErrorRequestHandler,
  req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: express.NextFunction
) {
  res.status(500);
  res.send({ message: err });
}

export function errorRouteHandler(err: unknown, next: express.NextFunction) {
  logger.error(err);
  if (err instanceof Error) {
    next(err.message);
  } else {
    next(err);
  }
}
