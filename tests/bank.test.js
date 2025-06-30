const request = require('supertest');
const app = require('../server');

describe('Bank Account Endpoints', () => {
  let token;
  const testEmail = `bankuser${Date.now()}@example.com`;
  const testPassword = 'test1234';

  beforeAll(async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Bank User',
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

  it('should update bank account with valid data', async () => {
    const res = await request(app)
      .put('/api/auth/bank-account')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountNumber: '1234567890',
        ifsc: 'SBIN0001234',
        bankName: 'State Bank',
        accountHolderName: 'Bank User'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.bankAccount).toHaveProperty('accountNumber', '1234567890');
  });

  it('should not update bank account with missing fields', async () => {
    const res = await request(app)
      .put('/api/auth/bank-account')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });
}); 