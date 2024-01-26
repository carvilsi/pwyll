/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const request = require('supertest');
const expect = require('chai').expect;

describe('users ', () => {
  const pwyll_machine = 'http://localhost:46520';

  it('should create a user', done => {
    request(pwyll_machine)
      .post('/user')
      .send({ username: 'dedalus' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.text.length).to.be.equal(26);
        done();
      });
  });

  it('should not allow creating an existing user', done => {
    request(pwyll_machine)
      .post('/user')
      .send({ username: 'dedalus' })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(
          /User dedalus already exists, please choose a different/.test(
            res.text
          )
        ).to.be.true;
        done();
      });
  });

  it('should not allow creating a very long username', done => {
    request(pwyll_machine)
      .post('/user')
      .send({ username: 'CthulhuTheOneThatSleepsDead' })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/Username must be not longer than 20 characters/.test(res.text))
          .to.be.true;
        done();
      });
  });

  it('should not allow creating a user without username', done => {
    request(pwyll_machine)
      .post('/user')
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/bad request for endpoint, mandatory: username/.test(res.text))
          .to.be.true;
        done();
      });
  });

  it('should not allow creating a user with empty username', done => {
    request(pwyll_machine)
      .post('/user')
      .send({ username: '' })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/Provide a user name/.test(res.text)).to.be.true;
        done();
      });
  });

  it('should not allow creating a user with blank username', done => {
    request(pwyll_machine)
      .post('/user')
      .send({ username: '   ' })
      .set('Accept', 'application/json')
      .expect(500)
      .end((err, res) => {
        expect(/Provide a user name/.test(res.text)).to.be.true;
        done();
      });
  });
});
