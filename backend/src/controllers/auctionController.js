/**
 * Auction Controller
 * Endpoints from Section 3.2
 * Business logic from Section 4.4
 */
const { Auction, Bid, Place, User, sequelize } = require('../../database/models');
const { Op } = require('sequelize');

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
        { association: 'place', attributes: ['id', 'name', 'token_id', 'category', 'base_image_uri'] },
        { association: 'seller', attributes: ['id', 'wallet_address', 'username'] },
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
        { association: 'seller', attributes: ['id', 'wallet_address', 'username'] },
        { association: 'winner', attributes: ['id', 'wallet_address', 'username'] },
        {
          association: 'bids',
          include: [{ association: 'bidder', attributes: ['id', 'wallet_address', 'username'] }],
        },
      ],
      order: [['created_at', 'DESC']],
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

    // Check place exists and is claimed
    const place = await Place.findByPk(place_id, {
      include: [{ association: 'claimer', attributes: ['id', 'wallet_address'] }],
    });
    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    // Only claimed places can be auctioned
    if (!place.is_claimed) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only claimed places can be auctioned' },
      });
    }

    // Verify the user creating auction is the claimer
    if (!place.claimer || place.claimer.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the claimer can auction this place' },
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
      seller_id: user.id,
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

    const auction = await Auction.findByPk(auction_id, {
      include: [{ association: 'seller', attributes: ['id', 'wallet_address'] }],
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Auction not found' },
      });
    }

    // Prevent seller from bidding on their own auction
    if (auction.seller && auction.seller.wallet_address.toLowerCase() === wallet_address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot bid on your own auction' },
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

    // Validate bid is at least min_price
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

    // Create bid (capture user category at bid time for winner determination)
    const bid = await Bid.create({
      auction_id,
      bidder_id: user.id,
      amount,
      user_category: user.category,
    });

    // Check for buyout (if bid >= max_price, auction ends immediately)
    if (auction.max_price && parseFloat(amount) >= parseFloat(auction.max_price)) {
      // Calculate final price with category discount
      const categoryDiscounts = {
        standard: 0,
        plus: 0.50,
        premium: 0.75,
      };
      const discount = categoryDiscounts[user.category] || 0;
      const final_price = parseFloat(auction.max_price) * (1 - discount);

      await auction.update({
        status: 'completed',
        winner_id: user.id,
        final_price,
      });

      // Transfer place ownership to the winner
      const place = await Place.findByPk(auction.place_id);
      if (place) {
        await place.update({
          claimed_by: user.id,
          claimed_at: new Date(),
        });
      }

      return res.status(201).json({
        success: true,
        data: bid,
        auction_completed: true,
        message: 'Buyout successful! Auction completed.',
        final_price,
      });
    }

    res.status(201).json({ success: true, data: bid });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel auction (only seller, only if no bids)
 */
const cancelAuction = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    const auction_id = parseInt(req.params.id);

    const auction = await Auction.findByPk(auction_id, {
      include: [{ association: 'seller' }, { association: 'bids' }],
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Auction not found' },
      });
    }

    if (auction.seller.wallet_address !== wallet_address.toLowerCase()) {
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
 * Priority from requirements (conversation.txt lines 196-200):
 * 1. Highest bid amount
 * 2. User category (Premium > Plus > Standard)
 * 3. Earliest timestamp
 */
const determineWinner = async (auction_id) => {
  const auction = await Auction.findByPk(auction_id, {
    include: [{ association: 'bids', include: [{ association: 'bidder' }] }],
  });

  if (!auction || !auction.bids || auction.bids.length === 0) {
    return null;
  }

  // Category ranking for comparison
  const categoryRank = {
    premium: 3,
    plus: 2,
    standard: 1,
  };

  // Sort bids by priority
  const sortedBids = auction.bids.sort((a, b) => {
    // 1. Highest bid amount
    const amountDiff = parseFloat(b.amount) - parseFloat(a.amount);
    if (amountDiff !== 0) return amountDiff;

    // 2. User category (Premium > Plus > Standard)
    const categoryDiff = categoryRank[b.user_category] - categoryRank[a.user_category];
    if (categoryDiff !== 0) return categoryDiff;

    // 3. Earliest timestamp
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const winningBid = sortedBids[0];

  // Calculate final price with category discount
  const categoryDiscounts = {
    standard: 0,    // 0% discount
    plus: 0.50,     // 50% discount
    premium: 0.75   // 75% discount
  };
  const discount = categoryDiscounts[winningBid.user_category] || 0;
  const final_price = parseFloat(winningBid.amount) * (1 - discount);

  return {
    winner_id: winningBid.bidder_id,
    winning_bid: winningBid,
    final_price: final_price,
  };
};

/**
 * End auction manually (seller only)
 */
const endAuction = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    const auction_id = parseInt(req.params.id);

    const auction = await Auction.findByPk(auction_id, {
      include: [{ association: 'seller', attributes: ['id', 'wallet_address'] }],
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Auction not found' },
      });
    }

    // Only seller can end auction
    if (auction.seller.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the auction creator can end the auction' },
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Auction is not active' },
      });
    }

    // Determine winner
    const winnerInfo = await determineWinner(auction_id);

    if (winnerInfo) {
      await auction.update({
        status: 'completed',
        winner_id: winnerInfo.winner_id,
        final_price: winnerInfo.final_price, // Use calculated final_price with discount
      });

      // Transfer place ownership to the winner
      const place = await Place.findByPk(auction.place_id);
      if (place) {
        await place.update({
          claimed_by: winnerInfo.winner_id,
          claimed_at: new Date(),
        });
      }
    } else {
      // No bids, just end it
      await auction.update({
        status: 'completed',
      });
    }

    res.json({ success: true, message: 'Auction ended successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuctions,
  getAuction,
  createAuction,
  placeBid,
  endAuction,
  cancelAuction,
  determineWinner,
};
