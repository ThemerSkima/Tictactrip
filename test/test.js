
var supertest = require('supertest');
var chai = require('chai');
var app = require('../index.js');
const { expect } = require('chai');

global.app = app;
global.expect = chai.expect;
global.request = supertest(app);


describe('GET /users', function () {
    it('returns a list of tasks', function (done) {
        request.get('/api/users')
            .end(function (err, res) {
                expect(res.body).to.have.length(4)
                done(err);
            });
    });
});


describe('POST /token', function () {
    it('Verifies token validity', function (done) {
        request.post('/api/token')
            .set({ 'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjIxOGRhMjNhYWEwYWYyN2U0NDNhZjEzIiwiZW1haWwiOiJ0b2tlbjFAZ21haWwuY29tIiwiaWF0IjoxNjQ1ODcxNjEwLCJleHAiOjE2NDU5NTgwMTB9.HyAlaig8_Ie8Y_DwnMkBBHcV-9Wah5_2uaHryIii-Cs' })
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });
    it('Verifies token absence', function (done) {
        request.post('/api/token')
            .expect(403)
            .end(function (err, res) {
                done(err);
            });
    });
    it('Verifies token fail', function (done) {
        request.post('/api/token')
            .set({ 'x-access-token': 'eyJhbGciOiJIssUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjIxOGRhMjNhYWEwYWYyN2U0NDNhZjEzIiwiZW1haWwiOiJ0b2tlbjFAZ21haWwuY29tIiwiaWF0IjoxNjQ1ODcxNjEwLCJleHAiOjE2NDU5NTgwMTB9.HyAlaig8_Ie8Y_DwnMkBBHcV-9Wah5_2uaHryIii-Cs' })
            .expect(401)
            .end(function (err, res) {
                done(err);
            });
    });
}); 


