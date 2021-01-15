const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./../../src/index');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('project', () => {
  it('프로젝트 목록 가져오기 성공해야 함', done => {
    chai
      .request(app)
      .get('/api/auth')
      .end((err, res) => {
        let cookie = res.headers['set-cookie'][0].split(';')[0];

        chai
          .request(app)
          .get('/api/projects')
          .set({
            Cookie: cookie,
          })
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
  });
});
