/* eslint-disable node/no-unpublished-import */
const pckg = require('./../package.json');
import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

describe('get the info', () => {
  const pwyll_machine = 'http://localhost:46520';

  test('should retieve info', async () => {
    const response = await request(pwyll_machine).get('/');
    expect(response.statusCode).toBe(200);
    const infoText = response.text;
    const regexp = new RegExp(`${pckg.name}@${pckg.version}`, 'i');
    expect(regexp.test(infoText)).toBe(true);
  });
});
