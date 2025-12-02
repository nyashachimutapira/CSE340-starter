jest.mock('../database');
const pool = require('../database');
const ratingModel = require('../models/rating-model');

describe('rating-model', () => {
  beforeEach(() => {
    pool.query = jest.fn();
  });

  test('upsertRating inserts or updates rating', async () => {
    pool.query.mockResolvedValue({ rows: [{ rating_id: 1, rating: 5 }] });
    const saved = await ratingModel.upsertRating({ inv_id: 1, account_id: 2, rating: 5 });
    expect(pool.query).toHaveBeenCalled();
    expect(saved.rating).toBe(5);
  });

  test('getAverageRating returns aggregate', async () => {
    pool.query.mockResolvedValue({ rows: [{ average_rating: 4.0, rating_count: '3' }] });
    const avg = await ratingModel.getAverageRating(1);
    expect(pool.query).toHaveBeenCalled();
    expect(avg.average_rating).toBeDefined();
  });

  test('getUserRating returns single row or null', async () => {
    pool.query.mockResolvedValue({ rows: [{ rating: 4 }] });
    const r = await ratingModel.getUserRating(1, 2);
    expect(pool.query).toHaveBeenCalled();
    expect(r.rating).toBe(4);
  });
});
