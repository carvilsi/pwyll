/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const Chance = require('chance');
import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

describe('commands CRUD', () => {
  const pwyll_machine = 'http://localhost:46520';
  let idCommandFirstUser: string;
  let idCommandSecondUser: string;
  let firstUserId: string;
  let secondUserId: string;
  const commandObj = {
    command: 'nodemon -e js,ts -x ts-node --files src/index.ts',
    description: 'dev mode nodemon typescript ts-node',
    userId: 'something',
  };
  const chance = new Chance();
  const firstUser = chance.name();
  const secondtUser = chance.name();

  test('mock some users', async () => {
    let res = await request(pwyll_machine)
      .post('/user')
      .send({ username: firstUser })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    firstUserId = JSON.parse(res.text);
    commandObj.userId = firstUserId;
    res = await request(pwyll_machine)
      .post('/user')
      .send({ username: secondtUser })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    secondUserId = JSON.parse(res.text);
  });

  test('should create a command', async () => {
    const res = await request(pwyll_machine)
      .post('/command')
      .send(commandObj)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    idCommandFirstUser = JSON.parse(res.text);
  });

  test('should create another command for second user', async () => {
    const res = await request(pwyll_machine)
      .post('/command')
      .send({
        command: 'nodemon src/',
        description: 'generic nodemon for source folder changes',
        userId: secondUserId,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text.length).toBe(26);
    idCommandSecondUser = JSON.parse(res.text);
  });

  test('should not create a command if provided user does not exists', async () => {
    const res = await request(pwyll_machine)
      .post('/command')
      .send({
        command: 'ls',
        description: 'list',
        userId: '625ae0149d0bd9638b60e498',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(
      /Not possible to store a command for a non exiting user/
    );
  });

  test('should not create a command if user is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/command')
      .send({ command: 'ls', description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: user/);
  });

  test('should not create a command if command is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/command')
      .send({ description: 'list' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: command/);
  });

  test('should not create a command if description is not provided', async () => {
    const res = await request(pwyll_machine)
      .post('/command')
      .send({ command: 'ls' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(
      /bad request for endpoint, mandatory: description/
    );
  });

  test('should find a command for any user', async () => {
    const res = await request(pwyll_machine)
      .get('/command/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(2);
  });

  test('should find a command restricted to first user', async () => {
    const res = await request(pwyll_machine)
      .get('/command/find')
      .query({
        q: 'nodemon',
        userId: firstUserId,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const foundCommand = JSON.parse(res.text);
    expect(foundCommand.length).toBe(1);
    expect(foundCommand[0].command).toBe(commandObj.command);
    expect(foundCommand[0].description).toBe(commandObj.description);
    expect(foundCommand[0].username).toBe(firstUser);
  });

  test('should delete a command by id and for second user', async () => {
    let res = await request(pwyll_machine)
      .delete(`/command/${idCommandSecondUser}/${secondUserId}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    let response = JSON.parse(res.text);
    expect(response).toBe(true);
    res = await request(pwyll_machine)
      .get('/command/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    response = JSON.parse(res.text);
    expect(response.length).toBe(1);
  });

  test('should update a command by id and for first user', async () => {
    const newCommand =
      './node_modules/nodemon/bin/nodemon -e js,ts -x ts-node --files src/index.ts';
    const newDescription =
      'dev mode nodemon typescript ts-node from node_modules';
    let res = await request(pwyll_machine)
      .put('/command')
      .send({
        command: newCommand,
        description: newDescription,
        userId: firstUserId,
        id: idCommandFirstUser,
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    let response = JSON.parse(res.text);
    expect(response).toBe(true);
    res = await request(pwyll_machine)
      .get('/command/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    response = JSON.parse(res.text);
    expect(response.length).toBeGreaterThanOrEqual(1);
    expect(response[0].command).toBe(newCommand);
    expect(response[0].description).toBe(newDescription);
    expect(response[0].username).toBe(firstUser);
  });

  test('should not delete a command without valid commandId', async () => {
    const res = await request(pwyll_machine)
      .delete(`/command/ccc4e699cd8d0f6588a3bccc/${secondUserId}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Command not found for deleting/);
  });

  test('should not delete a command with valid commandId but wrong user', async () => {
    const res = await request(pwyll_machine)
      .delete(`/command/${idCommandFirstUser}/${secondUserId}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Wrong user provided for deleting command/);
  });

  test('should not delete a command without valid userId', async () => {
    const res = await request(pwyll_machine)
      .delete(`/command/${idCommandSecondUser}/secondUserIdWrong`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/User does not exist for deleting/);
  });

  test('should not delete a command with valid commandID but userID from another user', async () => {
    const res = await request(pwyll_machine)
      .delete(`/command/${idCommandSecondUser}/${firstUserId}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Command not found for deleting/);
  });

  test('should not find a command restricted to invalid user', async () => {
    const res = await request(pwyll_machine)
      .get('/command/find')
      .query({
        q: 'nodemon',
        userId: 'aNonuserId',
      })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Any commands for provided user/);
  });

  test('should not find a command if query is not provided', async () => {
    const res = await request(pwyll_machine)
      .get('/command/find')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/bad request for endpoint, mandatory: q/);
  });

  test('should not find a command by query if does not match any', async () => {
    const res = await request(pwyll_machine)
      .get('/command/find')
      .query({ q: 'foobar' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text).length).toBe(0);
  });

  test('should retrieve a snippet by snippet ID', async () => {
    const res = await request(pwyll_machine)
      .get(`/command/${idCommandFirstUser}`)
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    const snippet = JSON.parse(res.text);
    expect(snippet.command).toBe(commandObj.command);
    expect(snippet.description).toBe(commandObj.description);
  });

  test('should not retrieve a snippet because snippet ID is not correct', async () => {
    const res = await request(pwyll_machine)
      .get('/command/ccc4e699cd8d0f6588a3bccc')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/command not found for/);
  });
});
