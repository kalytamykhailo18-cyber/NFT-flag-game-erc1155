# Municipal Place NFT Game - Complete Game Flow Documentation

**Version**: 1.0
**Date**: December 29, 2024
**Project**: ERC-1155 Place Photo Slice Collection Game
**Based on**: Client requirements from conversation.txt and ERC1155_PROJECT_REQUIREMENTS.md

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Game Concept](#2-game-concept)
3. [User Roles](#3-user-roles)
4. [Game Mechanics](#4-game-mechanics)
5. [Complete User Journey](#5-complete-user-journey)
6. [Admin Workflow](#6-admin-workflow)
7. [Technical Flow](#7-technical-flow)
8. [Auction System](#8-auction-system)
9. [Category System](#9-category-system)
10. [Progression & Rewards](#10-progression--rewards)
11. [Social Features](#11-social-features)

---

## 1. Project Overview

### What is this game?

A blockchain-based NFT collection game where players collect **photo slices** of real-world places to unlock complete **Place NFTs**. Each place's photo is divided into **pairs of slices**, and players must collect all pairs to claim ownership of the complete place.

### Key Characteristics

- **Blockchain**: Polygon Amoy Testnet (ERC-1155 standard)
- **Geographic Hierarchy**: Countries → Regions → Municipalities → Places
- **Collection Mechanic**: Pair-based slice collection (e.g., 2 pairs = 4 slices total)
- **Ownership Model**: Complete places become tradeable NFTs after all slices collected
- **Categories**: Standard, Plus, Premium (affects pricing and discounts)
- **Social Features**: Rankings, reputation, auctions, community

---

## 2. Game Concept

### The Core Loop

```
1. Browse Places
   ↓
2. Express Interest (free)
   ↓
3. Purchase Slice Pairs
   ↓
4. Complete All Pairs
   ↓
5. Claim Place NFT
   ↓
6. Trade via Auctions
```

### What Makes Places Special?

Each place represents a **real geographic location** with:
- **One complete photo** (base image)
- **Divided into slice pairs** (e.g., Pair 1: Left + Right, Pair 2: Left + Right)
- **Unique coordinates** (latitude, longitude)
- **Category tier** (standard/plus/premium)
- **Location type** (standardlocation, pluslocation, premiumlocation)

### The "Pair System" Explained

**Each place has a configurable number of pairs** (default: 2 pairs)

**Example with 2 pairs:**
```
Complete Place Photo
┌─────────┬─────────┐
│ Pair 1  │ Pair 2  │
│  Left   │  Left   │
├─────────┼─────────┤
│ Pair 1  │ Pair 2  │
│  Right  │  Right  │
└─────────┴─────────┘

User must own:
✓ Pair 1 Left + Pair 1 Right = Pair 1 Complete
✓ Pair 2 Left + Pair 2 Right = Pair 2 Complete
→ All pairs complete → Claim full Place NFT
```

---

## 3. User Roles

### Regular User (Player)

**Capabilities:**
- Connect wallet (MetaMask)
- Browse places by geography
- Express interest in places (free, no limit)
- Purchase slice pairs with MATIC
- View owned slices
- Track collection progress
- Claim completed places as NFTs
- Participate in auctions (bid on other users' places)
- View rankings and leaderboards

**Cannot:**
- Create new places
- Mint NFTs
- Modify place metadata
- Access admin panel

### Admin (Game Manager)

**Capabilities:**
- Create places from coordinates
- Generate place photos and slices
- Upload images to IPFS
- Mint Place NFTs on blockchain
- Manage geographic hierarchy (countries/regions/municipalities)
- View system statistics
- Moderate auctions

**Responsibilities:**
1. Populate the game world with places
2. Ensure image quality and metadata accuracy
3. Mint NFTs on blockchain
4. Maintain IPFS storage

---

## 4. Game Mechanics

### 4.1 Place Categories

**Three tiers with different benefits:**

| Category | Price Multiplier | Auction Discount | Rarity |
|----------|------------------|------------------|--------|
| **Standard** | 1x (base price) | 0% | Common |
| **Plus** | 1.5x | 50% | Uncommon |
| **Premium** | 3x | 75% | Rare |

**Example Pricing:**
- Standard slice: 0.01 MATIC
- Plus slice: 0.015 MATIC
- Premium slice: 0.03 MATIC

### 4.2 Slice Purchase Rules

**Restrictions:**
- ✅ User can purchase any available slice
- ✅ User CANNOT purchase the same slice twice
- ✅ Multiple users can own slices from the same place
- ✅ Slices are permanently owned (no expiration)

**Purchase Flow:**
1. User selects a slice from place detail page
2. Connects wallet if not connected
3. Approves transaction in MetaMask
4. Backend records purchase in database
5. User's slice count increases
6. Progress bar updates

### 4.3 Pair Completion

**A pair is complete when:**
- User owns BOTH the **left** and **right** slices of that pair number

**Example:**
```
Place has 2 pairs (4 slices total):

User Progress:
✓ Pair 1 Left  - Owned
✓ Pair 1 Right - Owned  → Pair 1 COMPLETE ✓
✗ Pair 2 Left  - Not owned
✗ Pair 2 Right - Not owned → Pair 2 INCOMPLETE ✗

Overall: 2/4 slices owned, 1/2 pairs complete
Status: NOT ready to claim
```

### 4.4 Place Claiming

**Requirements:**
1. User must own ALL pairs (completed_pairs === pair_count)
2. Place must be minted on blockchain (is_minted === true)
3. Place must NOT already be claimed (is_claimed === false)

**Claim Process:**
1. User clicks "Claim Place" button
2. Backend validates requirements
3. Smart contract transfers ERC-1155 NFT from admin wallet to user wallet
4. Transaction confirmed on blockchain
5. Place marked as claimed in database
6. User's reputation score increases (+100 points)
7. User's total_places_claimed counter increases

**After Claiming:**
- User now owns the complete Place NFT
- NFT appears in user's wallet (visible in MetaMask, OpenSea, etc.)
- User can trade/sell the place via auctions
- Slices remain visible in profile history

---

## 5. Complete User Journey

### Step-by-Step Gameplay

#### Phase 1: Discovery

**1. Landing Page**
- User sees featured places
- Recent auctions
- Top collectors leaderboard

**2. Geographic Exploration**
```
Home → Countries → Select Spain
       ↓
    Regions → Select Madrid
       ↓
 Municipalities → Select Madrid City
       ↓
    Places → Browse 8 places
```

**3. Place Selection**
- User clicks on "standardlocation_1"
- Sees complete place photo
- Views slice grid (e.g., 2 pairs = 4 slices)
- Checks current ownership status

#### Phase 2: Interest Expression (Optional)

**What is Interest?**
- Free way to "bookmark" a place
- Shows user is interested in collecting this place
- Visible to other users (social proof)
- Increases place's "interest_count" (affects popularity ranking)

**How to Express Interest:**
1. Click "Express Interest" button on place detail page
2. No wallet transaction needed (off-chain action)
3. User appears in "Interested Users" list
4. Can remove interest anytime

#### Phase 3: Slice Collection

**First Purchase:**
```
User Views Place:
┌─────────────────────────────┐
│ standardlocation_1          │
│ Madrid City, Madrid, Spain  │
├─────────────────────────────┤
│ [Complete Photo Preview]    │
├─────────────────────────────┤
│ Slice Grid:                 │
│ ┌──────┬──────┐            │
│ │Pair 1│Pair 1│ Price:     │
│ │ Left │Right │ 0.01 MATIC │
│ │[Buy] │[Buy] │            │
│ ├──────┼──────┤            │
│ │Pair 2│Pair 2│            │
│ │ Left │Right │            │
│ │[Buy] │[Buy] │            │
│ └──────┴──────┘            │
│                             │
│ Progress: 0/4 slices        │
│ Pairs Complete: 0/2         │
└─────────────────────────────┘
```

**User clicks "Buy" on Pair 1 Left:**
1. MetaMask popup appears
2. User confirms transaction (0.01 MATIC)
3. Transaction processes (~3-5 seconds)
4. Success notification
5. Slice turns green (owned)
6. Progress updates: 1/4 slices, 0/2 pairs

**Continuing Collection:**
- User buys Pair 1 Right
- Progress: 2/4 slices, **1/2 pairs complete** ✓
- User buys Pair 2 Left
- Progress: 3/4 slices, 1/2 pairs
- User buys Pair 2 Right
- Progress: 4/4 slices, **2/2 pairs complete** ✓✓
- **"Claim Place NFT" button appears!**

#### Phase 4: NFT Claim

**Claim Interface:**
```
┌─────────────────────────────┐
│ 🎉 All Pairs Complete! 🎉   │
├─────────────────────────────┤
│ You own all 4 slices!       │
│                             │
│ Pair 1: ✓ Complete          │
│ Pair 2: ✓ Complete          │
│                             │
│ [Claim Place NFT]           │
│                             │
│ This will transfer the      │
│ complete Place NFT to       │
│ your wallet.                │
└─────────────────────────────┘
```

**User clicks "Claim Place NFT":**
1. Backend validates ownership
2. Calls smart contract: `safeTransferFrom(adminWallet, userWallet, tokenId, 1, "0x")`
3. Transaction broadcast to Polygon
4. User sees transaction pending in MetaMask
5. After confirmation:
   - ✓ NFT appears in user's wallet
   - ✓ Place marked as "Claimed" on website
   - ✓ User's reputation +100 points
   - ✓ User's profile shows 1 claimed place

**Viewing NFT:**
- In MetaMask: Assets → NFTs → Place NFT
- On OpenSea: testnets.opensea.io/assets/amoy/{contract}/{tokenId}
- In Game Profile: "Claimed Places" tab

#### Phase 5: Trading (Optional)

**Creating an Auction:**
1. User goes to Profile → Claimed Places
2. Clicks "Create Auction" on owned place
3. Fills auction form:
   - Minimum Price: 0.05 MATIC
   - Buyout Price: 0.2 MATIC (optional)
   - Duration: 7 days
4. Submits auction
5. Place now listed in "Auctions" page

**Other users can now bid on this place!**

---

## 6. Admin Workflow

### Admin Responsibilities

The admin sets up the game world by creating places and minting NFTs.

### Complete Admin Process

#### Step 1: Setup Geographic Hierarchy

**Admin Panel → Geography Management**

```
1. Add Countries (4 total)
   - Spain (ES)
   - France (FR)
   - Germany (DE)
   - Italy (IT)

2. Add Regions (1 per country)
   - Madrid → Spain
   - Île-de-France → France
   - Bavaria → Germany
   - Lombardy → Italy

3. Add Municipalities (2 per region)
   - Madrid City (40.4168, -3.7038) → Madrid
   - Alcalá de Henares (40.4819, -3.3635) → Madrid
   - Paris (48.8566, 2.3522) → Île-de-France
   - Versailles (48.8014, 2.1301) → Île-de-France
   - ... (8 total)
```

#### Step 2: Create Places from Coordinates

**For each municipality, create 8 places:**

**Example: Creating a Standard Location**

**Admin Panel → Create Place**

```
Form Fields:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Municipality: [Madrid City ▼]
Location Type: [standardlocation ▼]
Category: [standard ▼]
Coordinates:
  Latitude:  40.4170
  Longitude: -3.7040
Pair Count: 2
Price: 0.01 MATIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Generate Place] button
```

**What Happens When Admin Clicks "Generate Place":**

1. **Backend calls SerpAPI** to search for location images
   - Query: "Madrid City 40.4170,-3.7040"
   - Returns Google Street View / Google Images results

2. **Download best image**
   - Selects highest quality result
   - Downloads to temp storage

3. **Image Processing (using sharp library)**
   ```
   Original Image (1200x800)
   ┌─────────────┬─────────────┐
   │   Pair 1    │   Pair 2    │
   │    Left     │    Left     │
   │  (600x400)  │  (600x400)  │
   ├─────────────┼─────────────┤
   │   Pair 1    │   Pair 2    │
   │   Right     │   Right     │
   │  (600x400)  │  (600x400)  │
   └─────────────┴─────────────┘

   Creates 4 slice images
   ```

4. **Upload to IPFS (Pinata)**
   - Base image → `ipfs://Qm...baseImage`
   - Slice 1 (Pair 1 Left) → `ipfs://Qm...slice1`
   - Slice 2 (Pair 1 Right) → `ipfs://Qm...slice2`
   - Slice 3 (Pair 2 Left) → `ipfs://Qm...slice3`
   - Slice 4 (Pair 2 Right) → `ipfs://Qm...slice4`

5. **Compute SHA-256 hashes**
   - Each slice gets a hash for integrity verification

6. **Create metadata JSON**
   ```json
   {
     "name": "standardlocation_1",
     "description": "A unique place in Madrid City, Madrid, Spain. Collect all slice pairs to claim this NFT! Join our community: https://t.me/PlaceNFTGame",
     "image": "ipfs://Qm...baseImage",
     "external_url": "http://localhost:5173/places/1001",
     "attributes": [
       {"trait_type": "Country", "value": "Spain"},
       {"trait_type": "Category", "value": "standard"},
       {"trait_type": "Location Type", "value": "standardlocation"},
       {"trait_type": "Pair Count", "value": 2}
     ],
     "properties": {
       "slices": [
         {
           "pair_index": 1,
           "slice_position": "left",
           "image_uri": "ipfs://Qm...slice1",
           "image_sha256": "0x..."
         },
         ...
       ]
     }
   }
   ```

7. **Upload metadata to IPFS**
   - Metadata → `ipfs://Qm...metadata`

8. **Save to database**
   - Create Place record with token_id, URIs, hashes
   - Create 4 PlacePhotoSlice records

**Result:**
- Place created but **NOT minted yet**
- Status: `is_minted = false`
- Visible on website but cannot be claimed

#### Step 3: Mint Place NFT on Blockchain

**Admin Panel → Places List → Click "Mint NFT"**

**What Happens:**

1. **Backend calls smart contract**
   ```javascript
   await placeNFTContract.mintPlace(
     tokenId,        // e.g., 1001
     metadataUri,    // "ipfs://Qm...metadata"
     metadataHash    // SHA-256 of metadata
   );
   ```

2. **Transaction broadcast to Polygon**
   - Gas paid by admin wallet
   - Transaction takes ~3-5 seconds

3. **On confirmation:**
   - Place updated: `is_minted = true`
   - NFT now exists on blockchain
   - Admin wallet holds NFT with amount = 1
   - Users can now purchase slices

4. **Verification:**
   - Check on PolygonScan: `https://amoy.polygonscan.com/token/{contract}?a={tokenId}`
   - Metadata visible on blockchain

**Admin repeats this process for all 64 places (8 per municipality)**

---

## 7. Technical Flow

### 7.1 Slice Purchase Technical Flow

```
┌─────────┐
│  USER   │ Clicks "Buy Slice" on frontend
└────┬────┘
     │
     ▼
┌─────────────────────────────────────┐
│ FRONTEND (React)                    │
│ - Validates user connected wallet   │
│ - Shows MetaMask transaction popup  │
│ - Calls: POST /api/slices/:id/purchase
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ BACKEND (Node/Express)              │
│ 1. Validate slice exists            │
│ 2. Check slice not already owned    │
│ 3. Verify user has enough MATIC     │
│ 4. Create UserPlaceSlice record     │
│ 5. Update PlacePhotoSlice:          │
│    - is_owned = true                │
│    - owned_by = user.id             │
│ 6. Update User:                     │
│    - total_slices_owned += 1        │
│ 7. Calculate progress               │
│ 8. Return response                  │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ DATABASE (PostgreSQL)               │
│ - UserPlaceSlice row inserted       │
│ - PlacePhotoSlice row updated       │
│ - User stats updated                │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ FRONTEND (React)                    │
│ - Shows success notification        │
│ - Updates slice grid (green check)  │
│ - Updates progress bar              │
│ - Shows "Claim NFT" if all complete │
└─────────────────────────────────────┘
```

### 7.2 Place Claim Technical Flow

```
┌─────────┐
│  USER   │ Clicks "Claim Place NFT"
└────┬────┘
     │
     ▼
┌─────────────────────────────────────┐
│ FRONTEND                            │
│ - Calls: POST /api/places/:id/claim │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ BACKEND                             │
│ 1. Validate all pairs complete      │
│ 2. Verify place is_minted = true    │
│ 3. Verify place is_claimed = false  │
│ 4. Call smart contract ──────┐      │
└────┬──────────────────────────┼─────┘
     │                          │
     │                          ▼
     │         ┌─────────────────────────────┐
     │         │ BLOCKCHAIN (Polygon)        │
     │         │ Contract: PlaceNFT (ERC-1155)│
     │         │ Function: safeTransferFrom  │
     │         │   from: admin wallet         │
     │         │   to: user wallet            │
     │         │   tokenId: place.token_id    │
     │         │   amount: 1                  │
     │         └────┬────────────────────────┘
     │              │
     │              ▼ (tx confirmed)
     │         ┌─────────────────────────────┐
     │         │ User wallet now owns NFT    │
     │         └─────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ BACKEND (continues)                 │
│ 5. Update Place:                    │
│    - is_claimed = true              │
│    - claimed_by = user.id           │
│    - claimed_at = NOW()             │
│    - claim_tx_hash = "0x..."        │
│ 6. Update User:                     │
│    - total_places_claimed += 1      │
│    - reputation_score += 100        │
│ 7. Return success response          │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ FRONTEND                            │
│ - Shows success animation           │
│ - Updates profile stats             │
│ - NFT visible in wallet             │
│ - Place marked as "Claimed"         │
└─────────────────────────────────────┘
```

---

## 8. Auction System

### 8.1 Auction Types

**Primary Market**: Users buy slices directly from the game
**Secondary Market**: Users trade claimed places via auctions

### 8.2 Creating an Auction

**Requirements:**
- User must own a claimed place
- Place must not already be in an active auction

**Auction Form:**
```
Create Auction
━━━━━━━━━━━━━━━━━━━━━━━━
Place: standardlocation_1

Minimum Price: [____] MATIC
  (Starting bid price)

Buyout Price: [____] MATIC (optional)
  (Instant purchase price)

Duration: [__] days
  (1-30 days)

[Create Auction]
```

### 8.3 Bidding Process

**How Bidding Works:**

```
Active Auction:
━━━━━━━━━━━━━━━━━━━━━━━━
Place: standardlocation_1
Seller: 0x1234...5678

Minimum Price: 0.05 MATIC
Buyout Price: 0.2 MATIC
Time Left: 5 days 3 hours

Current Highest Bid:
  0.08 MATIC
  by 0xABCD...EFGH (Premium)

Your Bid:
[_____] MATIC
[Place Bid]

Bid History:
  1. 0xABCD...EFGH - 0.08 MATIC (Premium) - 2 hours ago
  2. 0x9999...8888 - 0.06 MATIC (Plus) - 5 hours ago
  3. 0x1111...2222 - 0.05 MATIC (Standard) - 1 day ago
```

**Bid Requirements:**
- Bid must be higher than current highest bid
- If buyout price exists, bid can equal buyout to win instantly
- User's category is recorded with the bid

### 8.4 Winner Determination

**Sorting Priority (from client requirements):**

1. **Highest bid amount** (primary)
2. **User category** (Premium > Plus > Standard) (tiebreaker)
3. **Earliest timestamp** (final tiebreaker)

**Example Scenario:**

```
Final Bids:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bid   Amount    Category   Timestamp        Rank
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A     0.10      Standard   10:00 AM         3rd
B     0.10      Premium    10:05 AM         1st ← WINNER
C     0.10      Plus       10:02 AM         2nd
D     0.09      Premium    09:50 AM         4th
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All three (A, B, C) bid 0.10 MATIC
→ Category tiebreaker: Premium (B) wins over Plus (C) and Standard (A)
→ Bid B is the winner
```

### 8.5 Discount Application

**CRITICAL**: Discount applies to **final payment**, NOT bid ranking!

**Example:**

```
Winner: User B (Premium category)
Bid Amount: 0.10 MATIC
Category Discount: 75% (Premium)

Final Price Calculation:
  Bid Amount:     0.10 MATIC
  Discount (75%): -0.075 MATIC
  ────────────────────────
  Final Payment:   0.025 MATIC

User B pays only 0.025 MATIC but won with a 0.10 MATIC bid
```

**Discount Table:**
| Category | Discount | Example Bid | Final Payment |
|----------|----------|-------------|---------------|
| Standard | 0% | 0.10 MATIC | 0.10 MATIC |
| Plus | 50% | 0.10 MATIC | 0.05 MATIC |
| Premium | 75% | 0.10 MATIC | 0.025 MATIC |

### 8.6 Auction End States

**Completed (Winner):**
- Auction time expired
- Winner determined by algorithm
- Place NFT transferred to winner
- Winner pays final_price (with discount)
- Seller receives payment

**Completed (Buyout):**
- A bid equals or exceeds max_price
- Auction ends immediately
- Bidder pays max_price (with category discount)
- Place NFT transferred instantly

**Cancelled:**
- Seller cancels before any bids
- Place returned to seller
- No transfers occur

---

## 9. Category System

### 9.1 User Categories

**How Users Get Categories:**

**Standard** (Default):
- All new users start as Standard
- No special requirements

**Plus** (Upgrade):
- User must claim 3+ places
- Or purchase a Plus membership (future feature)

**Premium** (Exclusive):
- User must claim 10+ places
- Or purchase a Premium membership (future feature)

### 9.2 Category Benefits

| Benefit | Standard | Plus | Premium |
|---------|----------|------|---------|
| Auction Discount | 0% | 50% | 75% |
| Slice Price Multiplier | 1x | 1x | 1x |
| Bid Priority | Lowest | Medium | Highest |
| Profile Badge | Gray | Blue | Gold |
| Exclusive Places | No | No | Yes* |

*Premium-only places can be configured by admin

### 9.3 Place Categories

**Places also have categories:**

| Category | Example Places | Base Price | Rarity |
|----------|----------------|------------|--------|
| Standard | standardlocation_1-4 | 0.01 MATIC | Common |
| Plus | pluslocation_1-2 | 0.015 MATIC | Uncommon |
| Premium | premiumlocation_1-2 | 0.03 MATIC | Rare |

**Distribution (per municipality):**
- 4 Standard places (50%)
- 2 Plus places (25%)
- 2 Premium places (25%)

---

## 10. Progression & Rewards

### 10.1 Reputation System

**How Users Earn Reputation:**

| Action | Points | Notes |
|--------|--------|-------|
| Express interest | +1 | Per place |
| Purchase first slice | +5 | One-time |
| Complete a pair | +10 | Per pair |
| Claim a place | +100 | Per place |
| Win an auction | +50 | Per auction |
| Sell in auction | +25 | Per sale |

### 10.2 Leaderboards

**Top Collectors (User Rankings):**
- Ranked by: `total_places_claimed` (primary), then `reputation_score`
- Displays:
  - Rank (with medals for top 3)
  - Username
  - Wallet address
  - Category
  - Places claimed
  - Slices owned
  - Reputation score

**Popular Places (Place Rankings):**
- Ranked by: `interest_count` (how many users expressed interest)
- Displays:
  - Rank
  - Place name
  - Municipality
  - Category
  - Interest count
  - Claim status

### 10.3 Profile Statistics

**User Profile Displays:**

```
Profile: 0x1234...5678
Category: Plus Member
━━━━━━━━━━━━━━━━━━━━━━━━━━

Stats:
┌─────────────────┬──────┐
│ Places Claimed  │  3   │
│ Slices Owned    │  17  │
│ Reputation      │ 425  │
└─────────────────┴──────┘

Owned Slices:
[Grid of slice thumbnails]

Claimed Places:
[Grid of complete place NFTs]
```

---

## 11. Social Features

### 11.1 Interest System

**Purpose:**
- Social proof (show popularity)
- Bookmark favorite places
- Connect with like-minded collectors

**Features:**
- View list of users interested in a place
- See which places are trending
- Filter places by interest count

### 11.2 Community Integration

**Telegram Group:**
- Link in every place description
- Community discussions
- Trading opportunities
- Game updates

**Future Features (not yet implemented):**
- In-game chat
- User-to-user direct trades
- Guilds/Teams
- Collaborative challenges

### 11.3 Badges & Achievements (Future)

**Planned Achievements:**
- First Slice: Purchased your first slice
- Pair Complete: Completed your first pair
- Collector: Claimed 10 places
- Completionist: Owned slices from all municipalities
- Auctioneer: Won 5 auctions
- Trader: Sold 5 places

---

## 12. Example Walkthrough

### Complete Game Session

**Juan's Journey:**

**Day 1: Discovery**
1. Juan visits the website
2. Connects MetaMask wallet (0xJUAN...1234)
3. Browses Countries → Spain → Madrid → Madrid City
4. Sees 8 places, gets excited about "premiumlocation_1"
5. Clicks "Express Interest" (free)
6. Checks leaderboard, sees top collector has 15 places

**Day 2: First Purchase**
7. Juan decides to collect "standardlocation_1" (cheaper)
8. Clicks "Buy" on Pair 1 Left (0.01 MATIC)
9. MetaMask popup → Confirms transaction
10. Transaction success! Slice turns green
11. Progress shows: 1/4 slices, 0/2 pairs
12. Juan buys Pair 1 Right (0.01 MATIC)
13. Progress: 2/4 slices, **1/2 pairs ✓**
14. Juan's reputation: +15 points (first slice + pair complete)

**Day 3: Completion**
15. Juan buys Pair 2 Left (0.01 MATIC)
16. Progress: 3/4 slices, 1/2 pairs
17. Juan buys Pair 2 Right (0.01 MATIC)
18. Progress: 4/4 slices, **2/2 pairs ✓✓**
19. **"Claim Place NFT" button appears!**
20. Juan clicks "Claim Place NFT"
21. MetaMask transaction
22. Success! NFT transferred to Juan's wallet
23. Juan's stats updated:
    - Places Claimed: 1
    - Reputation: +100 (now 115 total)
    - Category: Still Standard

**Day 7: Trading**
24. Juan collects 2 more places (now has 3 total)
25. Decides to sell "standardlocation_1"
26. Creates auction:
    - Min Price: 0.05 MATIC
    - Buyout: 0.15 MATIC
    - Duration: 7 days
27. Auction goes live

**Day 10: Auction Bids**
28. User A (Standard) bids 0.06 MATIC
29. User B (Plus) bids 0.08 MATIC
30. User C (Premium) bids 0.07 MATIC
31. Current winner: User B (highest amount)

**Day 14: Auction Ends**
32. Auction time expires
33. Winner: User B (Plus category)
34. Final payment: 0.08 * 0.5 (50% discount) = 0.04 MATIC
35. NFT transferred to User B
36. Juan receives 0.04 MATIC
37. Juan's reputation +25 (seller bonus)

**Day 15: Continued Play**
38. Juan now has 2 claimed places, 140 reputation
39. Starts collecting in a different municipality
40. Joins Telegram community
41. Aims for 10 places to unlock Premium status

---

## 13. Key Gameplay Questions

### Q: Can multiple users own slices from the same place?
**A:** Yes! Each slice is unique, but different users can own different slices of the same place. However, only ONE user can claim the complete place NFT (whoever completes all pairs first).

### Q: What happens to slices after claiming the place?
**A:** The slices remain in your purchase history for tracking purposes, but the important ownership is the complete Place NFT now in your wallet.

### Q: Can I sell individual slices?
**A:** Not currently. You can only sell complete claimed places via auctions. Slices are not transferable individually.

### Q: How do I know which slices I need?
**A:** The place detail page shows a grid with all slices. Green = you own, Gray = available, Red = owned by others.

### Q: Can I express interest in multiple places?
**A:** Yes, unlimited! Interest is free and just shows which places you're tracking.

### Q: What if I can't afford Premium places?
**A:** Start with Standard places! They're cheaper and still count toward your collection progress. You can upgrade to collecting Plus/Premium places later.

### Q: How long do I have to complete a place?
**A:** No time limit! Collect at your own pace. Your purchased slices are permanent.

### Q: Can the admin change a place after I've bought slices?
**A:** The metadata can be updated by admin before minting, but after minting on blockchain, core properties (token ID, etc.) are immutable.

---

## 14. Technical Requirements for Players

### Wallet Setup

**Required:**
1. MetaMask browser extension installed
2. Wallet connected to Polygon Amoy Testnet
3. Small amount of test MATIC for transactions

**Getting Test MATIC:**
- Visit: https://faucet.polygon.technology/
- Select: Amoy Testnet
- Enter your wallet address
- Receive: 0.5 test MATIC (free)

### Network Configuration

**Add Polygon Amoy to MetaMask:**
```
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency Symbol: MATIC
Block Explorer: https://amoy.polygonscan.com
```

---

## 15. Summary

### The Game in Three Sentences

1. **Collect photo slices** of real-world places organized by geography (Countries → Regions → Municipalities → Places)
2. **Complete all pairs** of a place's slices to unlock the full Place NFT
3. **Trade your collection** via auctions with category-based discounts and build your reputation

### Why Play?

- ✅ **Collect unique NFTs** of real geographic locations
- ✅ **Complete challenges** by finishing slice pairs
- ✅ **Compete on leaderboards** for top collector status
- ✅ **Trade valuable places** via smart auctions
- ✅ **Earn discounts** by upgrading your category
- ✅ **Build reputation** through active participation
- ✅ **Join a community** of collectors and traders

---

**End of Game Flow Documentation**

*Version 1.0 - December 29, 2024*
*Based on Client Requirements: conversation.txt & ERC1155_PROJECT_REQUIREMENTS.md*
