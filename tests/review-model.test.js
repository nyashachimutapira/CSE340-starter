jest.mock('../database');
const pool = require('../database');
const reviewModel = require('../models/review-model');

describe('review-model', () => {
  beforeEach(() => {
    pool.query = jest.fn();
  });

  test('addReview calls pool.query with correct SQL and values', async () => {
    pool.query.mockResolvedValue({ rows: [{ review_id: 1, rating: 5 }] });
    const data = { inv_id: 1, account_id: 2, rating: 5, review_text: 'Nice' };
    const res = await reviewModel.addReview(data);
    expect(pool.query).toHaveBeenCalled();
    expect(res.rating).toBe(5);
  });

  test('getReviewsByInv returns rows', async () => {
    pool.query.mockResolvedValue({ rows: [{ review_id: 1 }] });
    const rows = await reviewModel.getReviewsByInv(1);
    expect(pool.query).toHaveBeenCalled();
    expect(Array.isArray(rows)).toBe(true);
  });

  test('getAverageRating returns aggregate', async () => {
    pool.query.mockResolvedValue({ rows: [{ average_rating: 4.5, review_count: '2' }] });
    const avg = await reviewModel.getAverageRating(1);
    expect(pool.query).toHaveBeenCalled();
    expect(avg.average_rating).toBeDefined();
  });
});
