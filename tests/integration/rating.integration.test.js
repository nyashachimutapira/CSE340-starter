// Integration test for ratings using a real test database.
if (!process.env.TEST_DATABASE_URL) {
  console.warn('Skipping integration test: TEST_DATABASE_URL not set');
  process.exit(0);
}

// Ensure models use TEST_DATABASE_URL
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const ratingModel = require('../../models/rating-model');

describe('ratings integration', () => {
  test('upsert and average rating', async () => {
    // Upsert a rating
    const saved = await ratingModel.upsertRating({ inv_id: 1, account_id: 99, rating: 4 });
    expect(saved).toBeDefined();
    expect(Number(saved.rating)).toBe(4);

    // Average should return a numeric value
    const avg = await ratingModel.getAverageRating(1);
    expect(avg).toBeDefined();
    expect(typeof avg.average_rating !== 'undefined').toBeTruthy();
  }, 20000);
});
