const express = require('express');
const router = new express.Router();
const favoriteController = require('../controllers/favoriteController');
const utilities = require('../utilities');

router.post('/toggle', utilities.requireAuth, utilities.handleErrors(favoriteController.toggleFavorite));
router.get('/user', utilities.requireAuth, utilities.handleErrors(favoriteController.getUserFavorites));
router.get('/status/:invId', utilities.requireAuth, utilities.handleErrors(async (req, res) => {
	const invId = Number(req.params.invId);
	const accountId = req.account.account_id;
	const favoriteModel = require('../models/favorite-model');
	try {
		const fav = await favoriteModel.isFavorited(invId, accountId);
		res.json({ favorited: fav });
	} catch (err) {
		if (err && err.code === '42P01') return res.json({ favorited: false });
		throw err;
	}
}));

module.exports = router;
