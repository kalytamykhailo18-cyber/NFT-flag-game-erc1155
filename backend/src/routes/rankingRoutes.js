/**
 * Ranking routes
 * Endpoints for user and place rankings
 */
const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

// GET /rankings/users - Get user rankings
router.get('/users', rankingController.getUserRankings);

// GET /rankings/places - Get place rankings
router.get('/places', rankingController.getPlaceRankings);

module.exports = router;
