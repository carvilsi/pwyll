/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
import { beforeAll, describe, expect, test } from '@jest/globals';
import {
  userLengthCheck,
  secretLengthCheck,
  getHash,
  userExistenceCheck,
} from './../src/util';
import testGlobals from './test_globals';
import request from 'supertest';

const Chance = require('chance');

describe('utils', () => {
  const chance = new Chance();
  const firstUser = chance.name();
  const firstUserSecret = chance.string();

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

  test('should not allow an empty or blank secret', () => {
    expect(() => secretLengthCheck('')).toThrow('Provide a secret');
    expect(() => secretLengthCheck('  ')).toThrow('Provide a secret');
    const res = secretLengthCheck('big-foobar-secret');
    expect(res).toBe(true);
  });

  test('should get the has for foobar', () => {
    const res = getHash('foobar');
    expect(res).toBe(
      'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2'
    );
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
});
