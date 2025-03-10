/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
import { describe, expect, test } from '@jest/globals';
import {
  userLengthCheck,
  userExistenceCheck,
  forbiddenNameCheck,
} from './../src/util';
import testGlobals from './test_globals';

const Chance = require('chance');

describe('utils', () => {
  const chance = new Chance();
  const firstUser = chance.name();

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
