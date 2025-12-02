const cartModel = require('../../models/cart-model');
const invModel = require('../../models/inventory-model');

jest.mock('../../models/cart-model');
jest.mock('../../models/inventory-model');

const cartController = require('../../controllers/cartController');

describe('cartController.addToCart', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, flash: jest.fn() };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), redirect: jest.fn() };
    jest.clearAllMocks();
  });

  test('redirects to login when not authenticated', async () => {
    await cartController.addToCart(req, res);
    expect(req.flash).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/account/login');
  });

  test('returns 400 for invalid payload', async () => {
    req.account = { account_id: 1 };
    req.body = { invId: 0, quantity: 1 };
    await cartController.addToCart(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('returns 404 when inventory not found', async () => {
    req.account = { account_id: 1 };
    req.body = { invId: 999, quantity: 1 };
    invModel.getInventoryById.mockResolvedValue(null);
    await cartController.addToCart(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('adds item to cart successfully', async () => {
    req.account = { account_id: 1, account_firstname: 'Test' };
    req.body = { invId: 2, quantity: 1 };
    invModel.getInventoryById.mockResolvedValue({ inv_id: 2, inv_year: 2020, inv_make: 'Make', inv_model: 'Model' });
    cartModel.addToCart.mockResolvedValue(true);

    await cartController.addToCart(req, res);

    expect(cartModel.addToCart).toHaveBeenCalledWith(1, 2, 1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, redirect: '/cart' }));
  });
});
