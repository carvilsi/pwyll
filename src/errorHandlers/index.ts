import express from 'express';
import { logger } from '../util';
import { MongoError } from 'mongodb';

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

export class UserIdentityError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, UserIdentityError.prototype);
  }
}

export function errorControllerHandler(error: unknown) {
  if (error instanceof MongoError) {
    logger.error(error);
    throw new Error(error.message);
  } else if (error instanceof UserIdentityError) {
    logger.error(error.message);
    throw new Error(error.message);
  } else if (error instanceof Error) {
    logger.error(error);
    if (/nvalid input syntax for type integer/.test(error.message)) {
      throw new Error('invalid id format');
    }
    throw new Error(error.message);
  } else {
    throw error;
  }
}
