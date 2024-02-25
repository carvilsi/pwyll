/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import testGlobals from './test_globals';

describe('snippets update', () => {
  let firstUserSnippetID: string;
  let firstUserID: string;
  let secondUserID: string;
  const snippetObj = testGlobals.__SNIPPET_OBJECT__;
  const chance = new Chance();
  const firstUser = chance.name();
  const secondtUser = chance.name();
  const firstUserSecret = chance.string({ pool: 'abcdef01234456789'});
  const secondUserSecret = chance.string({ pool: 'abcdef01234456789'});
  const fakeSnippetID = testGlobals.__FAKE_ID__;
  const newCommand = 'ls -la';
  const newDescription = 'list with hidden files and details';

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
        snippet: 'nodemon src/',
        description: 'generic nodemon for source folder changes',
        userID: secondUserID,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should update a snippet by id and for first user', async () => {
    let res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .put('/snippet')
      .send({
        snippet: newCommand,
        description: newDescription,
        userID: firstUserID,
        id: firstUserSnippetID,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    let response = JSON.parse(res.text);
    expect(response).toBe(true);
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get(`/snippet/${firstUserSnippetID}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    response = JSON.parse(res.text);
    expect(response.snippet).toBe(newCommand);
    expect(response.description).toBe(newDescription);
    expect(response.username).toBe(firstUser);
  });

  test('should not update a snippet for other user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .put('/snippet')
      .send({
        snippet: newCommand,
        description: newDescription,
        userID: secondUserID,
        id: firstUserSnippetID,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not update a snippet if secret is not valid', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .put('/snippet')
      .send({
        snippet: newCommand,
        description: newDescription,
        userID: firstUserID,
        id: firstUserSnippetID,
        secret: 'foobar',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not update a snippet if ID does not exist', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .put('/snippet')
      .send({
        snippet: newCommand,
        description: newDescription,
        userID: firstUserID,
        id: fakeSnippetID,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/snippet not found for/);
  });

  test('should no update a snippet if ID is not valid', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .put('/snippet')
      .send({
        snippet: newCommand,
        description: newDescription,
        userID: firstUserID,
        id: testGlobals.__INVALID_ID__,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });
});
