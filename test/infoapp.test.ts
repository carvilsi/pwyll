/* eslint-disable node/no-unpublished-import */
const pckg = require('./../package.json');
import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

describe('get the info', () => {
  const pwyll_machine = 'http://localhost:46520';

  test('should retieve info text', async () => {
    const response = await request(pwyll_machine).get('/');
    expect(response.statusCode).toBe(200);
    const regexp = new RegExp(`${pckg.name}@${pckg.version}`, 'i');
    expect(response.text).toMatch(regexp);
  });

  test('should retieve info object', async () => {
    const res = await request(pwyll_machine)
    .get('/info')
    .set('Accept', 'application/json');
    const response = JSON.parse(res.text);
    expect(res.statusCode).toBe(200);
    expect(response.version).toBe(pckg.version);
    expect(response.name).toBe(pckg.name);
  });
});
