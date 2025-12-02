const favoriteModel = require('../models/favorite-model');

const favoriteController = {};

favoriteController.toggleFavorite = async function toggleFavorite(req, res) {
  try {
    if (!req.account) return res.status(401).json({ error: 'Unauthorized' });
    const { inv_id } = req.body;
    const accountId = req.account.account_id;
    if (!inv_id) return res.status(400).json({ error: 'Missing inv_id' });

    const exists = await favoriteModel.isFavorited(inv_id, accountId);
    if (exists) {
      await favoriteModel.removeFavorite(inv_id, accountId);
      return res.json({ success: true, favorited: false });
    }

    await favoriteModel.addFavorite(inv_id, accountId);
    return res.json({ success: true, favorited: true });
  } catch (err) {
    console.error('Favorite toggle error:', err);
    if (err && err.code === '42P01') {
      return res.status(500).json({ error: 'Favorites feature not available.' });
    }
    res.status(500).json({ error: 'Unable to toggle favorite.' });
  }
};

favoriteController.getUserFavorites = async function getUserFavorites(req, res) {
  try {
    if (!req.account) return res.status(401).json({ error: 'Unauthorized' });
    const accountId = req.account.account_id;
    const sql = `SELECT f.inv_id, i.inv_make, i.inv_model, i.inv_year FROM public.favorites f JOIN public.inventory i ON f.inv_id = i.inv_id WHERE f.account_id = $1`;
    const pool = require('../database/');
    const result = await pool.query(sql, [Number(accountId)]);
    res.json({ favorites: result.rows || [] });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Unable to load favorites.' });
  }
};

favoriteController.getFavoriteStatus = async function getFavoriteStatus(req, res) {
  try {
    if (!req.account) return res.status(401).json({ error: 'Unauthorized' });
    const invId = Number(req.params.invId);
    const favoriteModel = require('../models/favorite-model');
    const fav = await favoriteModel.isFavorited(invId, req.account.account_id);
    res.json({ favorited: fav });
  } catch (err) {
    console.error('Get favorite status error:', err);
    if (err && err.code === '42P01') return res.json({ favorited: false });
    res.status(500).json({ error: 'Unable to determine favorite status.' });
  }
};

module.exports = favoriteController;
