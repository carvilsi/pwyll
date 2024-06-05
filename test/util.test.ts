/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
import { beforeAll, describe, expect, test } from '@jest/globals';
import {
  userLengthCheck,
  userExistenceCheck,
  getArgon2Hash,
  validateArgon2Hash,
  forbiddenNameCheck,
} from './../src/util';
import testGlobals from './test_globals';
import request from 'supertest';

const Chance = require('chance');

describe('utils', () => {
  const chance = new Chance();
  const firstUser = chance.name();
  const firstUserSecret = testGlobals.__STRONG_SECRET__;

  beforeAll(async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/user')
      .send({
        username: firstUser,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should check username length', () => {
    const res = userLengthCheck('peter');
    expect(res).toBe(true);
  });

  test('should not allow username longer than 20 characters', () => {
    expect(() => userLengthCheck('foobarfoobarfoobarfoobar')).toThrow(
      'Username must be not longer than 20 characters'
    );
  });

  test('should not allow an empty or blank username', () => {
    expect(() => userLengthCheck('')).toThrow('Provide a user name');
    expect(() => userLengthCheck('  ')).toThrow('Provide a user name');
  });

  test('should get the argon2 hash for foobar', async () => {
    const secret = 'foobar';
    const hash = await getArgon2Hash(secret);
    const res = await validateArgon2Hash(hash, secret);
    expect(res).toBe(true);
  });

  test('should success if username does not exists', async () => {
    const res = await userExistenceCheck('foobarlol');
    expect(res).toBe(true);
  });

  test('should fail if username exists', async () => {
    try {
      await userExistenceCheck(firstUser);
    } catch (error) {
      expect(error).toMatch(
        `User ${firstUser} already exists, please choose a different one`
      );
    }
  });

  test('should success if username is allowed', () => {
    const res = forbiddenNameCheck('foobarlol');
    expect(res).toBe(true);
  });

  test('should fail if the username is forbidden', () => {
    const forbiddenName = testGlobals.__FORBIDDEN_USER_NAMES__[0];
    try {
      forbiddenNameCheck(forbiddenName);
    } catch (error) {
      expect(error).toMatch(
        `${forbiddenName} is a forbidden name, please choose a different`
      );
    }
  });
});
