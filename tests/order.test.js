const request = require('supertest');
const app = require('../server');

describe('Order Endpoints', () => {
  let buyerToken, sellerToken, itemId, orderId, deliveryOTP;
  const buyerEmail = `buyer${Date.now()}@example.com`;
  const sellerEmail = `seller${Date.now()}@example.com`;
  const password = 'test1234';

  beforeAll(async () => {
    // Seller signup & verify
    await request(app).post('/api/auth/signup').send({
      name: 'Seller', email: sellerEmail, password, college: 'Test College', role: 'seller'
    });
    // Buyer signup & verify
    await request(app).post('/api/auth/signup').send({
      name: 'Buyer', email: buyerEmail, password, college: 'Test College', role: 'buyer'
    });
    // Login seller
    const sellerLogin = await request(app).post('/api/auth/login').send({ email: sellerEmail, password });
    sellerToken = sellerLogin.body.token;
    // Login buyer
    const buyerLogin = await request(app).post('/api/auth/login').send({ email: buyerEmail, password });
    buyerToken = buyerLogin.body.token;
    // Seller adds item
    const itemRes = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ title: 'Test Product', description: 'desc', price: 200, city: 'Delhi', college: 'Test College' });
    itemId = itemRes.body.item._id;
  });

  it('should place order (auth required)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ itemId });
    expect(res.statusCode).toBe(201);
    expect(res.body.order).toHaveProperty('itemId');
    orderId = res.body.order._id;
    deliveryOTP = res.body.deliveryOTP;
  });

  it('should not place order without auth', async () => {
    const res = await request(app).post('/api/orders').send({ itemId });
    expect(res.statusCode).toBe(401);
  });

  it('should confirm delivery with OTP', async () => {
    const res = await request(app)
      .post('/api/orders/confirm-delivery')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ orderId, otp: deliveryOTP });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Delivery confirmed/i);
  });
}); 