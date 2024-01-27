/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const request = require('supertest');
const expect = require('chai').expect;
const Chance = require('chance');

describe('commands CRUD', () => {
  const pwyll_machine = 'http://localhost:46520';
  let idCommandFirstUser;
  let idCommandSecondUser;
  let firstUserId;
  let secondUserId;
  const commandObj = {
    command: 'nodemon -e js,ts -x ts-node --files src/index.ts',
    description: 'dev mode nodemon typescript ts-node',
  };
  const chance = new Chance();
  const firstUser = chance.name();
  const secondtUser = chance.name();

  before(done => {
    request(pwyll_machine)
      .post('/user')
      .send({ username: firstUser })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.text.length).to.be.equal(26);
        firstUserId = JSON.parse(res.text);
        commandObj.userId = firstUserId;
        request(pwyll_machine)
          .post('/user')
          .send({ username: secondtUser })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            expect(res.text.length).to.be.equal(26);
            secondUserId = JSON.parse(res.text);
            done();
          });
      });
  });

  it('should create a command', done => {
    request(pwyll_machine)
      .post('/command')
      .send(commandObj)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.text.length).to.be.equal(26);
        idCommandFirstUser = JSON.parse(res.text);
        done();
      });
  });

  it('should create another command for second user', done => {
    request(pwyll_machine)
      .post('/command')
      .send({
        command: 'nodemon src/',
        description: 'generic nodemon for source folder changes',
        userId: secondUserId,
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.text.length).to.be.equal(26);
        idCommandSecondUser = JSON.parse(res.text);
        done();
      });
  });

  it('should not create a command if provided user does not exists', done => {
    request(pwyll_machine)
      .post('/command')
      .send({
        command: 'ls',
        description: 'list',
        userId: '625ae0149d0bd9638b60e498',
      })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(
          /Not possible to store a command for a non exiting user/.test(
            res.text
          )
        ).to.be.true;
        done();
      });
  });

  it('should not create a command if user is not provided', done => {
    request(pwyll_machine)
      .post('/command')
      .send({ command: 'ls', description: 'list' })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/bad request for endpoint, mandatory: user/.test(res.text)).to.be
          .true;
        done();
      });
  });

  it('should not create a command if command is not provided', done => {
    request(pwyll_machine)
      .post('/command')
      .send({ description: 'list' })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/bad request for endpoint, mandatory: command/.test(res.text)).to
          .be.true;
        done();
      });
  });

  it('should not create a command if description is not provided', done => {
    request(pwyll_machine)
      .post('/command')
      .send({ command: 'ls' })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(
          /bad request for endpoint, mandatory: description/.test(res.text)
        ).to.be.true;
        done();
      });
  });

  it('should find a command for any user', done => {
    request(pwyll_machine)
      .get('/command/find')
      .query({ q: 'nodemon' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        const response = JSON.parse(res.text);
        expect(response.length).to.be.at.least(2);
        done();
      });
  });

  it('should find a command restricted to first user', done => {
    request(pwyll_machine)
      .get('/command/find')
      .query({
        q: 'nodemon',
        userId: firstUserId,
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        const foundCommand = JSON.parse(res.text);
        expect(foundCommand.length).to.be.at.equal(1);
        expect(foundCommand[0].command).to.be.equal(commandObj.command);
        expect(foundCommand[0].description).to.be.equal(commandObj.description);
        expect(foundCommand[0].username).to.be.equal(firstUser);
        done();
      });
  });

  it('should delete a command by id and for second user', done => {
    request(pwyll_machine)
      .delete(`/command/${idCommandSecondUser}/${secondUserId}`)
      .set('Accept', 'application/json')
      .expect(200);
    done();
    // .end((err, res) => {
    //   const response = JSON.parse(res.text);
    //   expect(response).to.be.true;
    //   request(pwyll_machine)
    //     .get('/command/find')
    //     .query({ q: 'nodemon' })
    //     .set('Accept', 'application/json')
    //     .expect(200)
    //     .end((err, res) => {
    //       const response = JSON.parse(res.text);
    //       expect(response.length).to.be.equal(1);
    //       done();
    //     });
    // });
  });

  it('should update a command by id and for first user', done => {
    const newCommand =
      './node_modules/nodemon/bin/nodemon -e js,ts -x ts-node --files src/index.ts';
    const newDescription =
      'dev mode nodemon typescript ts-node from node_modules';
    request(pwyll_machine)
      .put('/command')
      .send({
        command: newCommand,
        description: newDescription,
        userId: firstUserId,
        id: idCommandFirstUser,
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        const response = JSON.parse(res.text);
        expect(response).to.be.true;
        request(pwyll_machine)
          .get('/command/find')
          .query({ q: 'nodemon' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            const response = JSON.parse(res.text);
            console.dir(response);
            expect(response.length).to.be.at.least(1);
            expect(response[0].command).to.be.equal(newCommand);
            expect(response[0].description).to.be.equal(newDescription);
            expect(response[0].username).to.be.equal(firstUser);
            done();
          });
      });
  });

  it('should not delete a command without valid commandId', done => {
    request(pwyll_machine)
      .delete(`/command/idCommandWrong/${secondUserId}`)
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/Command not found for deleting command/.test(res.text)).to.be
          .true;
        done();
      });
  });

  it('should not delete a command without valid userId', done => {
    request(pwyll_machine)
      .delete(`/command/${idCommandSecondUser}/secondUserIdWrong`)
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/User does not exist for deleting command/.test(res.text)).to.be
          .true;
        done();
      });
  });

  it('should not find a command restricted to invalid user', done => {
    request(pwyll_machine)
      .get('/command/find')
      .query({
        q: 'nodemon',
        userId: 'firstUserId',
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(/Any commands for provided user/.test(res.text)).to.be.true;
        done();
      });
  });

  it('should not find a command if query is not provided', done => {
    request(pwyll_machine)
      .get('/command/find')
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/bad request for endpoint, mandatory: q/.test(res.text)).to.be
          .true;
        done();
      });
  });

  it('should not find a command by query if does not match any', done => {
    request(pwyll_machine)
      .get('/command/find')
      .query({ q: 'foobar' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(JSON.parse(res.text).length).to.be.equal(0);
        done();
      });
  });
});
