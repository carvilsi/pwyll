/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
const request = require('supertest');
const expect = require('chai').expect;
const pckg = require('./../package.json');

describe('get the info', () => {
  const commander_machine = 'http://localhost:46520';

  it('should retieve info', done => {
    request(commander_machine)
      .get('/')
      .expect(200)
      .end((err, res) => {
        const infoText = res.text;
        const regexp = new RegExp(`${pckg.name}@${pckg.version}`, 'i');
        expect(regexp.test(infoText)).to.be.true;
        done();
      });
  });
});
