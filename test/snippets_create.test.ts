/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { beforeAll, describe, expect, test } from '@jest/globals';
import testGlobals from './test_globals';
import request from 'supertest';

describe('snippets create', () => {
  let firstUserID: string;
  let secondUserID: string;
  const snippetObj = testGlobals.__SNIPPET_OBJECT__;
  const secondSnippetObj = testGlobals.__SECOND_SNIPPET_OBJECT__;
  const chance = new Chance();
  const firstUser = chance.name();
  const secondtUser = chance.name();
  const firstUserSecret = testGlobals.__STRONG_SECRET__;
  const secondUserSecret = testGlobals.__SECOND_STRONG_SECRET__;

  beforeAll(async () => {
    let res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/user')
      .send({
        username: firstUser,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    firstUserID = JSON.parse(res.text);
    snippetObj.userID = firstUserID;
    snippetObj.secret = firstUserSecret;
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/user')
      .send({
        username: secondtUser,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    secondUserID = JSON.parse(res.text);
  });

  test('should create a snippet for first user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should create another snippet for second user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({
        snippet: secondSnippetObj.snippet,
        description: secondSnippetObj.description,
        userID: secondUserID,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should not create a snippet if provided user does not exists', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({
        snippet: 'ls',
        description: 'list',
        userID: testGlobals.__FAKE_ID__,
        secret: 'something',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not create a snippet if provided userID has an invalid format', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({
        snippet: 'ls',
        description: 'list',
        userID: testGlobals.__INVALID_ID__,
        secret: 'something',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not create a snippet if provided secret is not correct', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({
        snippet: 'ls',
        description: 'list',
        userID: secondUserID,
        secret: 'something wrong',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not create a snippet if user is not provided', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({ snippet: 'ls', description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: userID/);
  });

  test('should not create a snippet if secret is not provided', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({ snippet: 'ls', description: 'list', userID: firstUserID })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: secret/);
  });

  test('should not create a snippet if snippet is not provided', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({ description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: snippet/);
  });

  test('should not create a snippet if description is not provided', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({ snippet: 'ls' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(
      /bad request for endpoint, mandatory: description/
    );
  });
});
