/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

describe('snippets CRUD', () => {
  const pwyll_machine = 'http://localhost:46520';
  let idCommandFirstUser: string;
  let idCommandSecondUser: string;
  let firstUserID: string;
  let secondUserID: string;
  const snippetObj = {
    snippet: 'nodemon -e js,ts -x ts-node --files src/index.ts',
    description: 'dev mode nodemon typescript ts-node',
    userID: 'something',
    secret: 'a secret',
  };
  const chance = new Chance();
  const firstUser = chance.name();
  const secondtUser = chance.name();
  const firstUserSecret = 'the secret for first user';
  const secondUserSecret = 'the secret for second user';
  const newCommand =
    './node_modules/nodemon/bin/nodemon -e js,ts -x ts-node --files src/index.ts';
  const newDescription =
    'dev mode nodemon typescript ts-node from node_modules';

  test('mock some users', async () => {
    let res = await request(pwyll_machine)
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
    res = await request(pwyll_machine)
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

  test('should create a snippet', async () => {
    const res = await request(pwyll_machine)
      .post('/snippet')
      .send(snippetObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    idCommandFirstUser = JSON.parse(res.text);
  });

  test('should create another snippet for second user', async () => {
    const res = await request(pwyll_machine)
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

  test('should not create a snippet if provided user does not exists', async () => {
    const res = await request(pwyll_machine)
      .post('/snippet')
      .send({
        snippet: 'ls',
        description: 'list',
        userID: '625ae0149d0bd9638b60e498',
        secret: 'something',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not create a snippet if user is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/snippet')
      .send({ snippet: 'ls', description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: userID/);
  });

  test('should not create a snippet if secret is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/snippet')
      .send({ snippet: 'ls', description: 'list', userID: firstUserID })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: secret/);
  });

  test('should not create a snippet if snippet is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/snippet')
      .send({ description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: snippet/);
  });

  test('should not create a snippet if description is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/snippet')
      .send({ snippet: 'ls' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(
      /bad request for endpoint, mandatory: description/
    );
  });

  test('should find a snippet for any user', async () => {
    const res = await request(pwyll_machine)
      .get('/snippet/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(2);
  });

  test('should find a snippet restricted to first user', async () => {
    const res = await request(pwyll_machine)
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

  test('should delete a snippet by id and for second user', async () => {
    let res = await request(pwyll_machine)
      .delete(
        `/snippet/${idCommandSecondUser}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    let response = JSON.parse(res.text);
    expect(response).toBe(true);
    res = await request(pwyll_machine)
      .get('/snippet/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    response = JSON.parse(res.text);
    expect(response.length).toBe(1);
  });

  test('should update a snippet by id and for first user', async () => {
    let res = await request(pwyll_machine)
      .put('/snippet')
      .send({
        snippet: newCommand,
        description: newDescription,
        userID: firstUserID,
        id: idCommandFirstUser,
        secret: firstUserSecret,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    let response = JSON.parse(res.text);
    expect(response).toBe(true);
    res = await request(pwyll_machine)
      .get('/snippet/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(1);
    expect(response[0].snippet).toBe(newCommand);
    expect(response[0].description).toBe(newDescription);
    expect(response[0].username).toBe(firstUser);
  });

  test('should not delete a snippet without valid snippetID', async () => {
    const res = await request(pwyll_machine)
      .delete(
        `/snippet/ccc4e699cd8d0f6588a3bccc/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/snippet not found for/);
  });

  test('should not delete a snippet with valid snippetID but wrong user', async () => {
    const res = await request(pwyll_machine)
      .delete(
        `/snippet/${idCommandFirstUser}/${secondUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Wrong user provided for deleting snippet/);
  });

  test('should not delete a snippet without existing userID', async () => {
    const res = await request(pwyll_machine)
      .delete(
        `/snippet/${idCommandSecondUser}/ccc4e699cd8d0f6588a3bccc/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not delete a snippet without valid userID', async () => {
    const res = await request(pwyll_machine)
      .delete(
        `/snippet/${idCommandSecondUser}/secondUserIdWrong/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/invalid id format/);
  });

  test('should not delete a snippet with valid snippetID but userID from another user', async () => {
    const res = await request(pwyll_machine)
      .delete(
        `/snippet/${idCommandSecondUser}/${firstUserID}/${secondUserSecret}`
      )
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not find a snippet restricted to invalid userID', async () => {
    const res = await request(pwyll_machine)
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
    const res = await request(pwyll_machine)
      .get('/snippet/find')
      .query({
        q: 'nodemon',
        userID: 'ccc4e699cd8d0f6588a3bccc',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Invalid userID or secret/);
  });

  test('should not find a snippet if query is not provided', async () => {
    const res = await request(pwyll_machine)
      .get('/snippet/find')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: q/);
  });

  test('should not find a snippet by query if does not match any', async () => {
    const res = await request(pwyll_machine)
      .get('/snippet/find')
      .query({ q: 'foobar' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text).length).toBe(0);
  });

  test('should retrieve a snippet by snippet ID', async () => {
    const res = await request(pwyll_machine)
      .get(`/snippet/${idCommandFirstUser}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const snippet = JSON.parse(res.text);
    expect(snippet.snippet).toBe(newCommand);
    expect(snippet.description).toBe(newDescription);
  });

  test('should not retrieve a snippet because snippet ID is not correct', async () => {
    const res = await request(pwyll_machine)
      .get('/snippet/ccc4e699cd8d0f6588a3bccc')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/snippet not found for/);
  });
});
