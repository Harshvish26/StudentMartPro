const request = require('supertest');
const app = require('../server');

describe('Item Endpoints', () => {
  let token;
  let itemId;
  const testEmail = `itemuser${Date.now()}@example.com`;
  const testPassword = 'test1234';

  beforeAll(async () => {
    // Signup & verify user
    await request(app).post('/api/auth/signup').send({
      name: 'Item User',
      email: testEmail,
      password: testPassword,
      college: 'Test College',
      role: 'seller'
    });
    // Manually verify user in DB or call OTP verify endpoint if needed
    // Login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword
    });
    token = loginRes.body.token;
  });

  it('should not add item without auth', async () => {
    const res = await request(app).post('/api/items').send({
      title: 'Book',
      description: 'A good book',
      price: 100,
      city: 'Delhi',
      college: 'Test College'
    });
    expect(res.statusCode).toBe(401);
  });

  it('should add item with valid data and auth', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Book',
        description: 'A good book',
        price: 100,
        city: 'Delhi',
        college: 'Test College'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.item).toHaveProperty('title', 'Book');
    itemId = res.body.item._id;
  });

  it('should get all items (public)', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should search items by city', async () => {
    const res = await request(app).get('/api/items?city=Delhi');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 