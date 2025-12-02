const wishlistModel = require('../../models/wishlist-model');
const invModel = require('../../models/inventory-model');

jest.mock('../../models/wishlist-model');
jest.mock('../../models/inventory-model');

const wishlistController = require('../../controllers/wishlistController');

describe('wishlistController.addToWishlist', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, flash: jest.fn() };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), redirect: jest.fn() };
    jest.clearAllMocks();
  });

  test('redirects to login when not authenticated', async () => {
    await wishlistController.addToWishlist(req, res);
    expect(req.flash).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/account/login');
  });

  test('returns 400 for invalid payload', async () => {
    req.account = { account_id: 1 };
    req.body = { invId: 0 };
    await wishlistController.addToWishlist(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('returns 404 when inventory not found', async () => {
    req.account = { account_id: 1 };
    req.body = { invId: 999 };
    invModel.getInventoryById.mockResolvedValue(null);
    await wishlistController.addToWishlist(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('adds item to wishlist successfully', async () => {
    req.account = { account_id: 1, account_firstname: 'Jane' };
    req.body = { invId: 3 };
    invModel.getInventoryById.mockResolvedValue({ inv_id: 3, inv_year: 2021, inv_make: 'Make', inv_model: 'Model' });
    wishlistModel.getWishlistItem.mockResolvedValue(null);
    wishlistModel.addToWishlist.mockResolvedValue(true);

    await wishlistController.addToWishlist(req, res);

    expect(wishlistModel.addToWishlist).toHaveBeenCalledWith(1, 3);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, redirect: '/wishlist' }));
  });
});
