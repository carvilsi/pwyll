/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

describe('users ', () => {
  const pwyll_machine = 'http://localhost:46520';
  const chance = new Chance();
  const name = chance.name();

  test('should create a user', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ username: name })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should not allow creating an existing user', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ username: name })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(/already exists, please choose a different/.test(res.text)).toBe(
      true
    );
  });

  test('should not allow creating a very long username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ username: 'CthulhuTheOneThatSleepsDead' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(
      /Username must be not longer than 20 characters/.test(res.text)
    ).toBe(true);
  });

  test('should not allow creating a user without username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(/bad request for endpoint, mandatory: username/.test(res.text)).toBe(
      true
    );
  });

  test('should not allow creating a user with empty username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ username: '' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(/Provide a user name/.test(res.text)).toBe(true);
  });

  test('should not allow creating a user with blank username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ username: '   ' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(/Provide a user name/.test(res.text)).toBe(true);
  });
});
