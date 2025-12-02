// Jest mock for the database pool used by models.
const pool = {
  query: jest.fn(),
};

module.exports = pool;
