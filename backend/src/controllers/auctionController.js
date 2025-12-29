/**
 * Auction Controller
 * Endpoints from Section 3.2
 * Business logic from Section 4.4
 */
const { Auction, Bid, Place, User, sequelize } = require('../../database/models');
const { Op } = require('sequelize');

/**
 * Category values for comparison: standard=1, plus=2, premium=3
 */
const CATEGORY_VALUES = {
  standard: 1,
  plus: 2,
  premium: 3,
};

/**
 * Category discounts
 */
const CATEGORY_DISCOUNTS = {
  standard: 0,
  plus: 0.5,
  premium: 0.75,
};

/**
 * Get all auctions with optional filters
 */
const getAuctions = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.place_id) where.place_id = req.query.place_id;

    const auctions = await Auction.findAll({
      where,
      include: [
        { association: 'place', attributes: ['id', 'name', 'token_id', 'category'] },
        { association: 'creator', attributes: ['id', 'wallet_address', 'username'] },
        { association: 'winner', attributes: ['id', 'wallet_address', 'username'] },
        { association: 'bids', attributes: ['id'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: auctions });
  } catch (error) {
    next(error);
  }
};

/**
 * Get auction detail with bids
 */
const getAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        { association: 'place' },
        { association: 'creator', attributes: ['id', 'wallet_address', 'username'] },
        { association: 'winner', attributes: ['id', 'wallet_address', 'username'] },
        {
          association: 'bids',
          include: [{ association: 'user', attributes: ['id', 'wallet_address', 'username'] }],
          order: [['amount', 'DESC'], ['created_at', 'ASC']],
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Auction not found' },
      });
    }

    res.json({ success: true, data: auction });
  } catch (error) {
    next(error);
  }
};

/**
 * Create auction
 */
const createAuction = async (req, res, next) => {
  try {
    const { place_id, wallet_address, min_price, max_price, duration_hours } = req.body;

    if (!place_id || !wallet_address || !min_price || !duration_hours) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'place_id, wallet_address, min_price, and duration_hours are required' },
      });
    }

    // Check place exists and not claimed
    const place = await Place.findByPk(place_id);
    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    if (place.is_claimed) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot create auction for claimed place' },
      });
    }

    // Check no active auction exists for this place
    const existingAuction = await Auction.findOne({
      where: { place_id, status: 'active' },
    });

    if (existingAuction) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'An active auction already exists for this place' },
      });
    }

    // Get or create user
    const [user] = await User.findOrCreate({
      where: { wallet_address: wallet_address.toLowerCase() },
      defaults: { wallet_address: wallet_address.toLowerCase() },
    });

    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration_hours * 60 * 60 * 1000);

    const auction = await Auction.create({
      place_id,
      creator_id: user.id,
      min_price,
      max_price: max_price || null,
      start_time,
      end_time,
      status: 'active',
    });

    res.status(201).json({ success: true, data: auction });
  } catch (error) {
    next(error);
  }
};

/**
 * Place bid on auction
 * Winner determination from Section 4.4
 */
const placeBid = async (req, res, next) => {
  try {
    const { wallet_address, amount } = req.body;
    const auction_id = parseInt(req.params.id);

    if (!wallet_address || !amount) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'wallet_address and amount are required' },
      });
    }

    const auction = await Auction.findByPk(auction_id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Auction not found' },
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Auction is not active' },
      });
    }

    if (new Date() > auction.end_time) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Auction has ended' },
      });
    }

    if (parseFloat(amount) < parseFloat(auction.min_price)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Bid must be at least ${auction.min_price}` },
      });
    }

    // Get or create user
    const [user] = await User.findOrCreate({
      where: { wallet_address: wallet_address.toLowerCase() },
      defaults: { wallet_address: wallet_address.toLowerCase() },
    });

    // Create bid
    const bid = await Bid.create({
      auction_id,
      user_id: user.id,
      amount,
      user_category: user.category,
    });

    // Check for buyout
    if (auction.max_price && parseFloat(amount) >= parseFloat(auction.max_price)) {
      // End auction immediately with buyout
      const discount = CATEGORY_DISCOUNTS[user.category];
      const final_price = parseFloat(auction.max_price) * (1 - discount);

      await auction.update({
        status: 'completed',
        winner_id: user.id,
        final_price,
      });

      return res.json({
        success: true,
        data: bid,
        message: 'Buyout successful! You won the auction.',
        auction: await Auction.findByPk(auction_id),
      });
    }

    res.status(201).json({ success: true, data: bid });
  } catch (error) {
    next(error);
  }
};

/**
 * Instant buyout
 */
const buyout = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    const auction_id = parseInt(req.params.id);

    const auction = await Auction.findByPk(auction_id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Auction not found' },
      });
    }

    if (!auction.max_price) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'This auction does not have a buyout price' },
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Auction is not active' },
      });
    }

    // Get or create user
    const [user] = await User.findOrCreate({
      where: { wallet_address: wallet_address.toLowerCase() },
      defaults: { wallet_address: wallet_address.toLowerCase() },
    });

    // Create bid at max_price
    await Bid.create({
      auction_id,
      user_id: user.id,
      amount: auction.max_price,
      user_category: user.category,
    });

    // Apply discount
    const discount = CATEGORY_DISCOUNTS[user.category];
    const final_price = parseFloat(auction.max_price) * (1 - discount);

    // End auction
    await auction.update({
      status: 'completed',
      winner_id: user.id,
      final_price,
    });

    res.json({
      success: true,
      message: 'Buyout successful!',
      auction: await Auction.findByPk(auction_id, {
        include: [{ association: 'winner', attributes: ['id', 'wallet_address'] }],
      }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel auction (only creator, only if no bids)
 */
const cancelAuction = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    const auction_id = parseInt(req.params.id);

    const auction = await Auction.findByPk(auction_id, {
      include: [{ association: 'creator' }, { association: 'bids' }],
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Auction not found' },
      });
    }

    if (auction.creator.wallet_address !== wallet_address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the auction creator can cancel' },
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Auction is not active' },
      });
    }

    if (auction.bids && auction.bids.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot cancel auction with bids' },
      });
    }

    await auction.update({ status: 'cancelled' });

    res.json({ success: true, message: 'Auction cancelled' });
  } catch (error) {
    next(error);
  }
};

/**
 * Determine auction winner
 * Priority: 1. Highest bid, 2. Category (premium>plus>standard), 3. Earliest timestamp
 */
const determineWinner = async (auction_id) => {
  const auction = await Auction.findByPk(auction_id, {
    include: [{ association: 'bids', include: [{ association: 'user' }] }],
  });

  if (!auction || !auction.bids || auction.bids.length === 0) {
    return null;
  }

  // Sort bids by priority
  const sortedBids = auction.bids.sort((a, b) => {
    // 1. Highest bid amount
    const amountDiff = parseFloat(b.amount) - parseFloat(a.amount);
    if (amountDiff !== 0) return amountDiff;

    // 2. Category (premium > plus > standard)
    const catDiff = CATEGORY_VALUES[b.user_category] - CATEGORY_VALUES[a.user_category];
    if (catDiff !== 0) return catDiff;

    // 3. Earliest timestamp
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const winningBid = sortedBids[0];
  const discount = CATEGORY_DISCOUNTS[winningBid.user_category];
  const final_price = parseFloat(winningBid.amount) * (1 - discount);

  return {
    winner_id: winningBid.user_id,
    final_price,
    winning_bid: winningBid,
  };
};

module.exports = {
  getAuctions,
  getAuction,
  createAuction,
  placeBid,
  buyout,
  cancelAuction,
  determineWinner,
};
