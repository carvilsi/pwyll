/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import testGlobals from './test_globals';

describe('snippets delete', () => {
  let firstUserSnippetID: string;
  let secondUserSnippetID: string;
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
    
    secondUserID = JSON.parse(res.text);
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    
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
    
    secondUserSnippetID = JSON.parse(res.text);
  });

  test('should delete a snippet by id and for second user', async () => {
    let res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(`/snippet/${secondUserSnippetID}/${secondUserID}/${secondUserSecret}`)
      .set('Accept', 'application/json');
    let response = JSON.parse(res.text);
    expect(res.statusCode).toBe(200);
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
    console.log(response);
    expect(response.length).toBe(0);
  });

  test('should not delete a snippet without existing snippetID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(`/snippet/${fakeSnippetID}/${secondUserID}/${secondUserSecret}`)
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
        `/snippet/${firstUserSnippetID}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Wrong user provided for deleting snippet/);
  });

  test('should not delete a snippet without existing userID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${secondUserSnippetID}/${fakeSnippetID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not delete a snippet without valid userID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${secondUserSnippetID}/secondUserIdWrong/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not delete a snippet with valid snippetID but userID from another user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .delete(
        `/snippet/${secondUserSnippetID}/${firstUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });
});
