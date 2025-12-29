# Game Flow - How Users Play

## Game Concept

Users collect **photo slice pairs** of real places to unlock complete **Place NFTs**.

Each place photo is divided into **pairs of slices** (e.g., 2 pairs = 4 slices total).

**Goal**: Complete all pairs → Claim the Place NFT

---

## User Flow

### 1. Discovery & Browsing

```
User visits website
  ↓
Browses geographic hierarchy:
  Countries → Regions → Municipalities → Places
  ↓
Selects a place to view details
  ↓
Sees:
  - Complete place photo
  - Slice grid (pairs layout)
  - Price per slice
  - Current ownership status
```

### 2. Express Interest (Optional)

```
User clicks "Express Interest" button
  ↓
No payment required (free, off-chain)
  ↓
User added to "Interested Users" list
  ↓
Place's interest_count increases
```

**Purpose**: Bookmark favorite places, show popularity

---

### 3. Purchase Slices

```
User clicks "Buy" on a slice
  ↓
MetaMask popup appears
  ↓
User confirms transaction (pays MATIC)
  ↓
Transaction processes (~3-5 seconds)
  ↓
Slice marked as owned (turns green)
  ↓
Progress updates: X/Y slices, P/Q pairs complete
```

**Example Progress:**
- Buy Pair 1 Left → 1/4 slices, 0/2 pairs
- Buy Pair 1 Right → 2/4 slices, **1/2 pairs ✓**
- Buy Pair 2 Left → 3/4 slices, 1/2 pairs
- Buy Pair 2 Right → 4/4 slices, **2/2 pairs ✓✓**

**Rules:**
- Cannot buy the same slice twice
- Each slice purchased permanently
- No time limit to complete

---

### 4. Claim Place NFT

```
When ALL pairs complete:
  ↓
"Claim Place NFT" button appears
  ↓
User clicks button
  ↓
Backend validates ownership
  ↓
Smart contract transfers ERC-1155 NFT from admin to user
  ↓
MetaMask transaction confirmation
  ↓
Success:
  - NFT appears in user's wallet
  - Place marked as "Claimed"
  - User reputation +100 points
  - User total_places_claimed +1
```

**Result**: User now owns the complete Place NFT

---

### 5. Trading (Optional)

#### Create Auction

```
User goes to Profile → Claimed Places
  ↓
Clicks "Create Auction" on owned place
  ↓
Fills form:
  - Minimum Price (starting bid)
  - Buyout Price (instant win, optional)
  - Duration (days)
  ↓
Submits auction
  ↓
Place listed in "Auctions" page
```

#### Bidding on Auctions

```
User browses Auctions page
  ↓
Selects an auction
  ↓
Enters bid amount (must be > current highest)
  ↓
MetaMask transaction
  ↓
Bid recorded with user's category
  ↓
User becomes current highest bidder
```

**Winner Determination:**
1. Highest bid amount (primary)
2. User category: Premium > Plus > Standard (tiebreaker)
3. Earliest timestamp (final tiebreaker)

**Discount Applied to Payment (NOT bid ranking):**
- Standard: 0% discount
- Plus: 50% discount
- Premium: 75% discount

**Example:**
```
Winner bids 0.10 MATIC (Premium category)
  ↓
Discount: 75%
  ↓
Final payment: 0.025 MATIC (user only pays 25%)
```

---

## Complete Game Session Example

### Juan's Journey

**Day 1:**
1. Visits website, connects MetaMask
2. Browses: Spain → Madrid → Madrid City
3. Views "standardlocation_1" (2 pairs, 4 slices)
4. Clicks "Express Interest"

**Day 2:**
5. Buys Pair 1 Left (0.01 MATIC) → Progress: 1/4 slices
6. Buys Pair 1 Right (0.01 MATIC) → Progress: 2/4 slices, 1/2 pairs ✓

**Day 3:**
7. Buys Pair 2 Left (0.01 MATIC) → Progress: 3/4 slices
8. Buys Pair 2 Right (0.01 MATIC) → Progress: 4/4 slices, 2/2 pairs ✓✓
9. **"Claim Place NFT" button appears**
10. Clicks "Claim Place NFT"
11. NFT transferred to wallet
12. Stats updated: 1 place claimed, +100 reputation

**Day 7:**
13. Collects 2 more places (now has 3 total)
14. Creates auction for "standardlocation_1":
    - Min: 0.05 MATIC
    - Buyout: 0.15 MATIC
    - Duration: 7 days

**Day 14:**
15. Auction ends
16. Winner: User B (Plus category, bid 0.08 MATIC)
17. Final payment: 0.04 MATIC (50% discount)
18. NFT transferred to winner
19. Juan receives 0.04 MATIC

---

## Key Mechanics

### Pair System

```
Place Photo (e.g., 2 pairs)
┌──────────┬──────────┐
│  Pair 1  │  Pair 2  │
│   Left   │   Left   │
├──────────┼──────────┤
│  Pair 1  │  Pair 2  │
│  Right   │  Right   │
└──────────┴──────────┘

Pair Complete = Left + Right both owned
Place Complete = ALL pairs complete
```

### Category System

**User Categories:**
- **Standard**: Default, 0% auction discount
- **Plus**: 50% auction discount
- **Premium**: 75% auction discount

**Place Categories:**
- **Standard**: Cheapest (0.01 MATIC/slice)
- **Plus**: Medium (0.015 MATIC/slice)
- **Premium**: Expensive (0.03 MATIC/slice)

### Progression

**Earn Reputation:**
- Purchase slice: +5 points
- Complete pair: +10 points
- Claim place: +100 points
- Win auction: +50 points

**Unlock Benefits:**
- 3 places claimed → Plus category
- 10 places claimed → Premium category

---

## Summary Flow Diagram

```
START
  ↓
Browse Places
  ↓
Express Interest (optional, free)
  ↓
Purchase Slices (pay MATIC per slice)
  ↓
Complete All Pairs?
  NO → Keep buying slices
  YES ↓
Claim Place NFT (blockchain transfer)
  ↓
Own Complete Place NFT
  ↓
Trade via Auction (optional)
  ↓
Continue collecting more places
```

---

**End of Game Flow**
