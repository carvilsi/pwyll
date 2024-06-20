/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import testGlobals from './test_globals';
import fs from 'node:fs';
import axios from 'axios';
import { finished } from 'node:stream/promises';
import { unlink } from 'node:fs/promises';

describe('snippets export', () => {
  let firstSnippetID: string;
  let secondSnippetID: string;
  let firstUserID: string;
  const snippetObj = testGlobals.__SNIPPET_OBJECT__;
  const secondSnippetObj = testGlobals.__SECOND_SNIPPET_OBJECT__;
  const chance = new Chance();
  const firstUsername = chance.name().replace(' ', '_');
  const firstUserSecret = testGlobals.__STRONG_SECRET__;

  beforeAll(async () => {
    let res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/user')
      .send({
        username: firstUsername,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    firstUserID = JSON.parse(res.text);
    snippetObj.userID = firstUserID;
    snippetObj.secret = firstUserSecret;
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    firstSnippetID = JSON.parse(res.text);
    res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .post('/snippet')
      .send({
        snippet: secondSnippetObj.snippet,
        description: secondSnippetObj.description,
        userID: firstUserID,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    secondSnippetID = JSON.parse(res.text);
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
  });

  test('should export a json file with all snippet for a user', async () => {
    const response = await axios({
      method: 'GET',
      url: `${testGlobals.__PYWLL_SERVER_URL__}/snippet/export`,
      params: { userID: firstUserID },
      responseType: 'stream',
    });
    expect(response.status).toBe(200);
    const writeStream = fs.createWriteStream(testGlobals.__EXPORT_FILE__);
    response.data.pipe(writeStream);
    await finished(writeStream);
    const exportedJSON = JSON.parse(
      fs.readFileSync(testGlobals.__EXPORT_FILE__, 'utf-8')
    );
    let count = 0;
    expect(exportedJSON[count]._id).toBe(firstSnippetID);
    expect(exportedJSON[count].snippet).toBe(snippetObj.snippet);
    expect(exportedJSON[count].description).toBe(snippetObj.description);
    expect(exportedJSON[count].user.username).toBe(firstUsername);
    expect(exportedJSON[count].user._id).toBe(firstUserID);
    count++;
    expect(exportedJSON[count]._id).toBe(secondSnippetID);
    expect(exportedJSON[count].snippet).toBe(secondSnippetObj.snippet);
    expect(exportedJSON[count].description).toBe(secondSnippetObj.description);
    expect(exportedJSON[count].user.username).toBe(firstUsername);
    expect(exportedJSON[count].user._id).toBe(firstUserID);
  });

  test('should not export snippets without a valid userID', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get(`/snippet/export?userID=${testGlobals.__INVALID_ID__}`)
      .expect(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not export snippets with valid snippetID but wrong user', async () => {
    const res = await request(testGlobals.__PYWLL_SERVER_URL__)
      .get(`/snippet/export?userID=${testGlobals.__FAKE_ID__}`)
      .expect(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  afterAll(async () => {
    await unlink(testGlobals.__EXPORT_FILE__);
  });
});
