const request = require('supertest');
const app = require('../server');

describe('Wallet Endpoints', () => {
  let token;
  const testEmail = `walletuser${Date.now()}@example.com`;
  const testPassword = 'test1234';

  beforeAll(async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Wallet User',
      email: testEmail,
      password: testPassword,
      college: 'Test College',
      role: 'seller'
    });
    // Login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword
    });
    token = loginRes.body.token;
  });

  it('should get wallet info (auth required)', async () => {
    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('balance');
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });

  it('should not request withdrawal with insufficient balance', async () => {
    const res = await request(app)
      .post('/api/wallet/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Insufficient balance/i);
  });
});
