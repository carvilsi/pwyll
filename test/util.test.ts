/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
import { beforeAll, describe, expect, test } from '@jest/globals';
import {
  userLengthCheck,
  secretLengthCheck,
  getHash,
  userExistenceCheck,
  generateSalt,
} from './../src/util';
import testGlobals from './test_globals';
import request from 'supertest';
import config from 'config';
import { createHash } from 'node:crypto';
import { getSaltOrCreateOne } from '../src/controllers/sec_controller';

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

  test('should get the has for foobar', async () => {
    const secret = 'foobar';
    const pepper = config.get('pepper');
    const hash = createHash('sha3-512');
    const salt = await getSaltOrCreateOne();
    hash.update(`${salt}${secret}${pepper}`);
    const res = await getHash(secret);
    expect(res).toBe(hash.digest('hex'));
  });

  test('should generate salt for db', () => {
    const salt = generateSalt();
    expect(salt.length).toBe(56);
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
