/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import testGlobals from './test_globals';

describe.skip('snippets read (find)', () => {
  let firstUserSnippetID: string;
  let firstUserID: string;
  let secondUserID: string;
  const snippetObj = testGlobals.__SNIPPET_OBJECT__;
  const secondSnippetObj = testGlobals.__SECOND_SNIPPET_OBJECT__;
  const chance = new Chance();
  const firstUser = chance.name();
  const secondtUser = chance.name();
  const firstUserSecret = testGlobals.__STRONG_SECRET__;
  const secondUserSecret = testGlobals.__SECOND_STRONG_SECRET__;
  const fakeSnippetID = testGlobals.__FAKE_ID__;

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
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    firstUserSnippetID = JSON.parse(res.text);
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
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

  test('should find a snippet for any user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(2);
  });

  test('should find a snippet with different words', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .query({ q: 'dev typescript' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(1);
  });

  test('should find a snippet restricted to first user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .query({
        q: 'nodemon',
        userID: firstUserID,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const foundCommand = JSON.parse(res.text);
    expect(foundCommand.length).toBe(1);
    expect(foundCommand[0].snippet).toBe(snippetObj.snippet);
    expect(foundCommand[0].description).toBe(snippetObj.description);
    expect(foundCommand[0].username).toBe(firstUser);
  });

  test('should not find a snippet restricted to invalid userID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .query({
        q: 'nodemon',
        userID: 'aNonuserID',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not find a snippet restricted to non existing userID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .query({
        q: 'nodemon',
        userID: testGlobals.__FAKE_ID__,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not find a snippet if query is not provided', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: q/);
  });

  test('should not find a snippet by query if does not match any', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .query({
        q: 'foobar',
        userID: firstUserID,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text).length).toBe(0);
  });

  test('should retrieve a snippet by snippet ID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get(`/snippet/${firstUserSnippetID}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const foundCommand = JSON.parse(res.text);
    expect(foundCommand.snippet).toBe(snippetObj.snippet);
    expect(foundCommand.description).toBe(snippetObj.description);
    expect(foundCommand.username).toBe(firstUser);
  });

  test('should not retrieve a snippet because snippet ID does not exist', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get(`/snippet/${fakeSnippetID}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/snippet not found for/);
  });

  test('should not retrieve a snippet because snippet ID is not valid', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get(`/snippet/${testGlobals.__INVALID_ID__}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });
});
