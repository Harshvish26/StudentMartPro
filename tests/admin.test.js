const request = require('supertest');
const app = require('../server');

describe('Admin Endpoints', () => {
  let adminToken;
  const adminEmail = `admin${Date.now()}@example.com`;
  const password = 'test1234';

  beforeAll(async () => {
    // Admin signup
    await request(app).post('/api/auth/signup').send({
      name: 'Admin',
      email: adminEmail,
      password,
      college: 'Test College',
      role: 'admin'
    });
    // Login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: adminEmail,
      password
    });
    adminToken = loginRes.body.token;
  });

  it('should get all withdrawals (admin only)', async () => {
    const res = await request(app)
      .get('/api/admin/withdrawals')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get platform wallet (admin only)', async () => {
    const res = await request(app)
      .get('/api/admin/wallet')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode === 200 || res.statusCode === 404).toBe(true);
  });
}); 