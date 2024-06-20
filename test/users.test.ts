/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { describe, expect, test } from '@jest/globals';
import request, { Response } from 'supertest';
import testGlobals from './test_globals';

async function createUser(
  username?: string,
  secret?: string
): Promise<Response> {
  return await request(testGlobals.__PYWLL_SERVER_URL__)
    .post('/user')
    .send({
      username: username,
      secret: secret,
    })
    .set('Accept', 'application/json');
}

describe('users ', () => {
  const chance = new Chance();
  const name = chance.name().replace(' ', '_');

  test('should create a user', async () => {
    const res = await createUser(name, testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should not allow creating a user if secret is not provided', async () => {
    const res = await createUser(name, undefined);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: secret/);
  });

  test('should not allow creating an existing user', async () => {
    const res = await createUser(name, testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/already exists, please choose a different one/);
  });

  test('should not allow creating users with forbidden names', async () => {
    const forbiddenNames = testGlobals.__FORBIDDEN_USER_NAMES__;
    for (let i = 0; i < forbiddenNames.length; i++) {
      const res = await createUser(
        forbiddenNames[i],
        testGlobals.__STRONG_SECRET__
      );
      expect(res.statusCode).toBe(500);
      expect(res.text).toMatch(
        /is a forbidden name, please choose a different one/
      );
    }
  });

  test('should not allow creating a very long username', async () => {
    const res = await createUser(
      'CthulhuTheOneThatSleepsDead',
      testGlobals.__STRONG_SECRET__
    );
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Username must be not longer than 20 characters/);
  });

  test('should not allow creating a user without username', async () => {
    const res = await createUser();
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: username/);
  });

  test('should not allow creating a user with empty username', async () => {
    const res = await createUser('', testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a user name/);
  });

  test('should not allow creating a user with blank username', async () => {
    const res = await createUser('        ', testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a user name/);
  });

  test('should not allow creating a user with a space character', async () => {
    const res = await createUser('Frodo Bolson', testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Space characters not allowed for user name/);
  });

  test('should not allow creating a user with a space characters', async () => {
    const res = await createUser(
      'Frodo  Bolson',
      testGlobals.__STRONG_SECRET__
    );
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Space characters not allowed for user name/);
  });

  test('should not allow creating a user with empty secret', async () => {
    const res = await createUser(chance.name().replace(' ', '_'), '');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a secret/);
  });

  test('should not allow creating a user with blank secret', async () => {
    const res = await createUser(chance.name().replace(' ', '_'), '     ');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a secret/);
  });
});
