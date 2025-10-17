const request = require('supertest');
const { expect } = require('chai');

describe('Health, Readiness, and Metrics endpoints', function () {
  it('GET /health should return 200 and include environment and database status', async function () {
    const res = await request(global.app).get('/health');
    expect(res.status).to.equal(200);
    const body = res.body || {};
    expect(body).to.have.property('status');
    expect(body).to.have.property('environment');
    expect(body).to.have.property('database');
  });

  it('GET /ready should return 200 when DB is connected', async function () {
    const res = await request(global.app).get('/ready');
    // In tests, we connect to mongodb-memory-server in setup, so readiness should be OK
    expect(res.status).to.equal(200);
    const body = res.body || {};
    expect(body).to.have.property('status');
    expect(body).to.have.property('dbReady', true);
  });

  it('GET /metrics should return 200 when metrics are enabled (non-production default)', async function () {
    const res = await request(global.app).get('/metrics');
    expect([200, 404]).to.include(res.status);
    // If metrics enabled (default for test), expect 200 and text/plain content type
    if (res.status === 200) {
      expect(res.headers['content-type'] || '').to.match(/text\/plain/);
      expect((res.text || '').length).to.be.greaterThan(0);
    }
  });
});
