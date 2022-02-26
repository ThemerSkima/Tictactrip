var assert = require('assert');
var app = require('../app.js')
describe('test login', function () {
    it('should return true', function () {
        console.log(app.ExobackApiRoutes.post("/login", async (req, res) => { console.log('here') }))
    });
});
/*describe('test', () => {
    it('test', () => {
        setTimeout(() => {
            throw new Error('Unexpected crash');
        }, 10);
    });
});*/