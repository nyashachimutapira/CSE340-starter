jest.mock('../../models/cart-model', () => ({
  addToCart: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../models/wishlist-model', () => ({
  addToWishlist: jest.fn().mockResolvedValue(true),
  getWishlistItem: jest.fn().mockResolvedValue(null),
  removeFromWishlist: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../models/inventory-model', () => ({
  getInventoryById: jest.fn().mockResolvedValue({ inv_id: 2, inv_year: 2022, inv_make: 'Make', inv_model: 'Model' }),
}));

const request = require('supertest');
const express = require('express');

describe('Cart/Wishlist integration (routes)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // middleware to simulate authenticated user
    app.use((req, res, next) => { req.account = { account_id: 1, account_firstname: 'Test' }; next(); });
    const cartRoute = require('../../routes/cartRoute');
    const wishlistRoute = require('../../routes/wishlistRoute');
    app.use('/cart', cartRoute);
    app.use('/wishlist', wishlistRoute);
  });

  test('POST /cart/add returns success JSON', async () => {
    const res = await request(app).post('/cart/add').send({ invId: 2, quantity: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('POST /wishlist/add returns success JSON', async () => {
    const res = await request(app).post('/wishlist/add').send({ invId: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
