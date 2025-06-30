const request = require('supertest');
const app = require('../server');

describe('Auth Endpoints', () => {
  let testEmail = `testuser${Date.now()}@example.com`;
  let testPassword = 'test1234';

  it('should signup a new user and send OTP', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: testEmail,
        password: testPassword,
        college: 'Test College',
        role: 'buyer'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/OTP sent/i);
  });

  it('should not login before OTP verification', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not verified/i);
  });
}); 