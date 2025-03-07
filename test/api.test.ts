/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
const pckg = require('./../package.json');
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request, { Response } from 'supertest';
import testGlobals from './test_globals';
import { server } from '../src/index';
import { unlink } from 'fs/promises';
import axios from 'axios';
import fs from 'node:fs';
import { finished } from 'node:stream/promises';

async function createUser(
  username?: string,
  secret?: string
): Promise<Response> {
  return await request(server)
    .post('/user')
    .send({
      username: username,
      secret: secret,
    })
    .set('Accept', 'application/json');
}

afterAll(() => {
  server.close();
});

describe('get the info', () => {
  test('should retieve info text', async () => {
    const response = await request(server).get('/');
    expect(response.statusCode).toBe(200);
    const regexp = new RegExp(`${pckg.name}@${pckg.version}`, 'i');
    expect(response.text).toMatch(regexp);
  });

  test('should retieve info object', async () => {
    const res = await request(server)
      .get('/info')
      .set('Accept', 'application/json');
    const response = JSON.parse(res.text);
    expect(res.statusCode).toBe(200);
    expect(response.version).toBe(pckg.version);
    expect(response.name).toBe(pckg.name);
  });
});

describe('users ', () => {
  const chance = new Chance();
  const name = chance.name();

  test('should create a user', async () => {
    const res = await createUser(name, testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(200);
  });

  test('should not allow creating a user if secret is not provided', async () => {
    const res = await createUser(name, undefined);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: secret/);
  });

  test('should not allow creating an existing user', async () => {
    const res = await createUser(name, testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/already exists, please choose a different/);
  });

  test('should not allow creating users with forbidden names', async () => {
    const forbiddenNames = testGlobals.__FORBIDDEN_USER_NAMES__;
    for (let i = 0; i < forbiddenNames.length; i++) {
      const res = await createUser(
        forbiddenNames[i],
        testGlobals.__STRONG_SECRET__
      );
      expect(res.statusCode).toBe(500);
      expect(res.text).toMatch(
        /is a forbidden name, please choose a different/
      );
    }
  });

  test('should not allow creating a very long username', async () => {
    const res = await createUser(
      'CthulhuTheOneThatSleepsDead',
      testGlobals.__STRONG_SECRET__
    );
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Username must be not longer than 20 characters/);
  });

  test('should not allow creating a user without username', async () => {
    const res = await createUser();
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: username/);
  });

  test('should not allow creating a user with empty username', async () => {
    const res = await createUser('', testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a user name/);
  });

  test('should not allow creating a user with blank username', async () => {
    const res = await createUser('        ', testGlobals.__STRONG_SECRET__);
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a user name/);
  });

  test('should not allow creating a user with empty secret', async () => {
    const res = await createUser(chance.name(), '');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a secret/);
  });

  test('should not allow creating a user with blank secret', async () => {
    const res = await createUser(chance.name(), '     ');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Provide a secret/);
  });
});

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
    let res = await request(server)
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
    res = await request(server)
      .post('/user')
      .send({
        username: secondtUser,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    secondUserID = JSON.parse(res.text);
  });

  test('should create a snippet for first user', async () => {
    const res = await request(server)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should create another snippet for second user', async () => {
    const res = await request(server)
      .post('/snippet')
      .send({
        snippet: secondSnippetObj.snippet,
        description: secondSnippetObj.description,
        userID: secondUserID,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should not create a snippet if provided user does not exists', async () => {
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
      .post('/snippet')
      .send({ snippet: 'ls', description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: userID/);
  });

  test('should not create a snippet if secret is not provided', async () => {
    const res = await request(server)
      .post('/snippet')
      .send({ snippet: 'ls', description: 'list', userID: firstUserID })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: secret/);
  });

  test('should not create a snippet if snippet is not provided', async () => {
    const res = await request(server)
      .post('/snippet')
      .send({ description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: snippet/);
  });

  test('should not create a snippet if description is not provided', async () => {
    const res = await request(server)
      .post('/snippet')
      .send({ snippet: 'ls' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(
      /bad request for endpoint, mandatory: description/
    );
  });
});

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
    let res = await request(server)
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
    res = await request(server)
      .post('/user')
      .send({
        username: secondtUser,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    secondUserID = JSON.parse(res.text);
    res = await request(server)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    firstUserSnippetID = JSON.parse(res.text);
    res = await request(server)
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
    let res = await request(server)
      .delete(
        `/snippet/${secondUserSnippetID}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    let response = JSON.parse(res.text);
    expect(res.statusCode).toBe(200);
    expect(response).toBe(true);

    res = await request(server)
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
    const res = await request(server)
      .delete(`/snippet/${fakeSnippetID}/${secondUserID}/${secondUserSecret}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/snippet not found for/);
  });

  test('should not delete a snippet without a valid snippetID', async () => {
    const res = await request(server)
      .delete(
        `/snippet/${testGlobals.__INVALID_ID__}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not delete a snippet with valid snippetID but wrong user', async () => {
    const res = await request(server)
      .delete(
        `/snippet/${firstUserSnippetID}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Wrong user provided for deleting snippet/);
  });

  test('should not delete a snippet without existing userID', async () => {
    const res = await request(server)
      .delete(
        `/snippet/${secondUserSnippetID}/${fakeSnippetID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not delete a snippet without valid userID', async () => {
    const res = await request(server)
      .delete(
        `/snippet/${secondUserSnippetID}/secondUserIdWrong/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not delete a snippet with valid snippetID but userID from another user', async () => {
    const res = await request(server)
      .delete(
        `/snippet/${secondUserSnippetID}/${firstUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });
});

describe('snippets export', () => {
  let firstSnippetID: string;
  let secondSnippetID: string;
  let firstUserID: string;
  const snippetObj = testGlobals.__SNIPPET_OBJECT__;
  const secondSnippetObj = testGlobals.__SECOND_SNIPPET_OBJECT__;
  const chance = new Chance();
  const firstUsername = chance.name();
  const firstUserSecret = testGlobals.__STRONG_SECRET__;

  beforeAll(async () => {
    let res = await request(server)
      .post('/user')
      .send({
        username: firstUsername,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    firstUserID = JSON.parse(res.text);
    snippetObj.userID = firstUserID;
    snippetObj.secret = firstUserSecret;
    res = await request(server)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    firstSnippetID = JSON.parse(res.text);
    res = await request(server)
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

    expect(exportedJSON[count].id).toBe(firstSnippetID);
    expect(exportedJSON[count].snippet).toBe(snippetObj.snippet);
    expect(exportedJSON[count].description).toBe(snippetObj.description);
    expect(exportedJSON[count].username).toBe(firstUsername);
    expect(exportedJSON[count].userId).toBe(firstUserID);
    count++;
    expect(exportedJSON[count].id).toBe(secondSnippetID);
    expect(exportedJSON[count].snippet).toBe(secondSnippetObj.snippet);
    expect(exportedJSON[count].description).toBe(secondSnippetObj.description);
    expect(exportedJSON[count].username).toBe(firstUsername);
    expect(exportedJSON[count].userId).toBe(firstUserID);
  });

  test('should not export snippets without a valid userID', async () => {
    const res = await request(server)
      .get(`/snippet/export?userID=${testGlobals.__INVALID_ID__}`)
      .expect(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not export snippets with valid snippetID but wrong user', async () => {
    const res = await request(server)
      .get(`/snippet/export?userID=${testGlobals.__FAKE_ID__}`)
      .expect(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  afterAll(async () => {
    await unlink(testGlobals.__EXPORT_FILE__);
  });
});

describe('snippets read (find)', () => {
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
    let res = await request(server)
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
    res = await request(server)
      .post('/user')
      .send({
        username: secondtUser,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    secondUserID = JSON.parse(res.text);
    res = await request(server)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    firstUserSnippetID = JSON.parse(res.text);
    res = await request(server)
      .post('/snippet')
      .send({
        snippet: secondSnippetObj.snippet,
        description: secondSnippetObj.description,
        userID: secondUserID,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should find a snippet for any user', async () => {
    const res = await request(server)
      .get('/snippet/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(2);
  });

  test('should find a snippet with different words', async () => {
    const res = await request(server)
      .get('/snippet/find')
      .query({ q: 'dev typescript' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(1);
  });

  test('should find a snippet restricted to first user', async () => {
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
      .get('/snippet/find')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: q/);
  });

  test('should not find a snippet by query if does not match any', async () => {
    const res = await request(server)
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
    const res = await request(server)
      .get(`/snippet/${firstUserSnippetID}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const foundCommand = JSON.parse(res.text);
    expect(foundCommand.snippet).toBe(snippetObj.snippet);
    expect(foundCommand.description).toBe(snippetObj.description);
    expect(foundCommand.username).toBe(firstUser);
  });

  test('should not retrieve a snippet because snippet ID does not exist', async () => {
    const res = await request(server)
      .get(`/snippet/${fakeSnippetID}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/snippet not found for/);
  });

  test('should not retrieve a snippet because snippet ID is not valid', async () => {
    const res = await request(server)
      .get(`/snippet/${testGlobals.__INVALID_ID__}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });
});

describe('snippets update', () => {
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
  const newCommand = 'ls -la';
  const newDescription = 'list with hidden files and details';

  beforeAll(async () => {
    let res = await request(server)
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
    res = await request(server)
      .post('/user')
      .send({
        username: secondtUser,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    secondUserID = JSON.parse(res.text);
    res = await request(server)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);

    firstUserSnippetID = JSON.parse(res.text);
    res = await request(server)
      .post('/snippet')
      .send({
        snippet: secondSnippetObj.snippet,
        description: secondSnippetObj.description,
        userID: secondUserID,
        secret: secondUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should update a snippet by id and for first user', async () => {
    let res = await request(server)
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
    res = await request(server)
      .get(`/snippet/${firstUserSnippetID}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    response = JSON.parse(res.text);
    expect(response.snippet).toBe(newCommand);
    expect(response.description).toBe(newDescription);
    expect(response.username).toBe(firstUser);
  });

  test('should not update a snippet for other user', async () => {
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
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
