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
      .send({ 
        username: name,
        secret: 'my secret'
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should not allow creating a user if secret is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ username: name })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: secret/);
  });

  test('should not allow creating an existing user', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ 
        username: name,
        secret: 'my secret' 
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/already exists, please choose a different/);
  });

  test('should not allow creating a very long username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ 
        username: 'CthulhuTheOneThatSleepsDead',
        secret: 'my secret' 
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Username must be not longer than 20 characters/);
  });

  test('should not allow creating a user without username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: username/);
  });

  test('should not allow creating a user with empty username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ 
        username: '',
        secret: 'my secret' 
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a user name/);
  });

  test('should not allow creating a user with blank username', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ 
        username: '   ',
        secret: 'my secret'
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a user name/);
  });

  test('should not allow creating a user with empty secret', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ 
        username: 'aragorn',
        secret: '' 
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a secret/);
  });

  test('should not allow creating a user with blank secret', async () => {
    const res = await request(pwyll_machine)
      .post('/user')
      .send({ 
        username: 'gandalf',
        secret: '     '
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a secret/);
  });
});
