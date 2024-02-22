/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import testGlobals from './test_globals';

describe('snippets delete', () => {
  let idCommandFirstUser: string;
  let idCommandSecondUser: string;
  let firstUserID: string;
  let secondUserID: string;
  const snippetObj = testGlobals.__SNIPPET_OBJECT__;
  const chance = new Chance();
  const firstUser = chance.name();
  const secondtUser = chance.name();
  const firstUserSecret = chance.string();
  const secondUserSecret = chance.string();
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
    idCommandFirstUser = JSON.parse(res.text);
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
    idCommandSecondUser = JSON.parse(res.text);
  });

  test('should delete a snippet by id and for second user', async () => {
    let res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${idCommandSecondUser}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    let response = JSON.parse(res.text);
    expect(response).toBe(true);
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get('/snippet/find')
      .query({ 
        q: 'nodemon',
        userID: secondUserID, 
    })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    response = JSON.parse(res.text);
    expect(response.length).toBe(0);
  });

  test('should not delete a snippet without existing snippetID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${fakeSnippetID}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/snippet not found for/);
  });

  test('should not delete a snippet without a valid snippetID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${testGlobals.__INVALID_ID__}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not delete a snippet with valid snippetID but wrong user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${idCommandFirstUser}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Wrong user provided for deleting snippet/);
  });

  test('should not delete a snippet without existing userID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${idCommandSecondUser}/${fakeSnippetID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not delete a snippet without valid userID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${idCommandSecondUser}/secondUserIdWrong/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not delete a snippet with valid snippetID but userID from another user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${idCommandSecondUser}/${firstUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });
});
