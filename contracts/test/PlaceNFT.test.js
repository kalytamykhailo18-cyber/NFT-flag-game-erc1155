/**
 * PlaceNFT Contract Tests
 *
 * Tests all functionality as specified in Section 6.1
 */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('PlaceNFT', function () {
  let placeNFT;
  let owner;
  let minter;
  let curator;
  let pauser;
  let user1;
  let user2;

  // Role constants
  let MINTER_ROLE;
  let CURATOR_ROLE;
  let PAUSER_ROLE;
  let ADMIN_ROLE;
  let DEFAULT_ADMIN_ROLE;

  beforeEach(async function () {
    [owner, minter, curator, pauser, user1, user2] = await ethers.getSigners();

    const PlaceNFT = await ethers.getContractFactory('PlaceNFT');
    placeNFT = await PlaceNFT.deploy();
    await placeNFT.waitForDeployment();

    // Get role constants
    MINTER_ROLE = await placeNFT.MINTER_ROLE();
    CURATOR_ROLE = await placeNFT.CURATOR_ROLE();
    PAUSER_ROLE = await placeNFT.PAUSER_ROLE();
    ADMIN_ROLE = await placeNFT.ADMIN_ROLE();
    DEFAULT_ADMIN_ROLE = await placeNFT.DEFAULT_ADMIN_ROLE();

    // Grant roles to test accounts
    await placeNFT.grantRole(MINTER_ROLE, minter.address);
    await placeNFT.grantRole(CURATOR_ROLE, curator.address);
    await placeNFT.grantRole(PAUSER_ROLE, pauser.address);
  });

  describe('Deployment', function () {
    it('Should set the deployer as admin', async function () {
      expect(await placeNFT.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await placeNFT.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it('Should grant all roles to deployer', async function () {
      expect(await placeNFT.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await placeNFT.hasRole(CURATOR_ROLE, owner.address)).to.be.true;
      expect(await placeNFT.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });
  });

  describe('Minting', function () {
    const tokenId = 1001;
    const tokenUri = 'ipfs://QmTest123';
    const metadataHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    it('Should mint a new place', async function () {
      await expect(placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash))
        .to.emit(placeNFT, 'PlaceMinted')
        .withArgs(tokenId, tokenUri, metadataHash);

      expect(await placeNFT.isPlaceMinted(tokenId)).to.be.true;
      expect(await placeNFT.placeExists(tokenId)).to.be.true;
      expect(await placeNFT.balanceOf(minter.address, tokenId)).to.equal(1);
    });

    it('Should store metadata hash', async function () {
      await placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash);
      expect(await placeNFT.getPlaceMetadataHash(tokenId)).to.equal(metadataHash);
    });

    it('Should set token URI', async function () {
      await placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash);
      expect(await placeNFT.uri(tokenId)).to.equal(tokenUri);
    });

    it('Should revert if token ID is 0', async function () {
      await expect(
        placeNFT.connect(minter).mintPlace(0, tokenUri, metadataHash)
      ).to.be.revertedWithCustomError(placeNFT, 'InvalidTokenId');
    });

    it('Should revert if place already minted', async function () {
      await placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash);
      await expect(
        placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash)
      ).to.be.revertedWithCustomError(placeNFT, 'PlaceAlreadyMinted');
    });

    it('Should revert if caller is not minter', async function () {
      await expect(
        placeNFT.connect(user1).mintPlace(tokenId, tokenUri, metadataHash)
      ).to.be.reverted;
    });
  });

  describe('Claiming', function () {
    const tokenId = 1001;
    const tokenUri = 'ipfs://QmTest123';
    const metadataHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    beforeEach(async function () {
      await placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash);
    });

    it('Should claim a place', async function () {
      await expect(placeNFT.connect(minter).claimPlace(tokenId, user1.address))
        .to.emit(placeNFT, 'PlaceClaimed')
        .withArgs(tokenId, user1.address);

      expect(await placeNFT.isPlaceClaimed(tokenId)).to.be.true;
      expect(await placeNFT.getPlaceClaimedBy(tokenId)).to.equal(user1.address);
      expect(await placeNFT.balanceOf(user1.address, tokenId)).to.equal(1);
      expect(await placeNFT.balanceOf(minter.address, tokenId)).to.equal(0);
    });

    it('Should revert if place not minted', async function () {
      await expect(
        placeNFT.connect(minter).claimPlace(9999, user1.address)
      ).to.be.revertedWithCustomError(placeNFT, 'PlaceNotMinted');
    });

    it('Should revert if place already claimed', async function () {
      await placeNFT.connect(minter).claimPlace(tokenId, user1.address);
      await expect(
        placeNFT.connect(minter).claimPlace(tokenId, user2.address)
      ).to.be.revertedWithCustomError(placeNFT, 'PlaceAlreadyClaimed');
    });

    it('Should revert if claiming to zero address', async function () {
      await expect(
        placeNFT.connect(minter).claimPlace(tokenId, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(placeNFT, 'InvalidTokenId');
    });
  });

  describe('URI Updates', function () {
    const tokenId = 1001;
    const tokenUri = 'ipfs://QmTest123';
    const metadataHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const newUri = 'ipfs://QmNewUri456';
    const newHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    beforeEach(async function () {
      await placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash);
    });

    it('Should update URI and hash', async function () {
      await expect(placeNFT.connect(curator).setPlaceURI(tokenId, newUri, newHash))
        .to.emit(placeNFT, 'PlaceURIUpdated')
        .withArgs(tokenId, newUri, newHash);

      expect(await placeNFT.uri(tokenId)).to.equal(newUri);
      expect(await placeNFT.getPlaceMetadataHash(tokenId)).to.equal(newHash);
    });

    it('Should revert if place not minted', async function () {
      await expect(
        placeNFT.connect(curator).setPlaceURI(9999, newUri, newHash)
      ).to.be.revertedWithCustomError(placeNFT, 'PlaceNotMinted');
    });

    it('Should revert if caller is not curator', async function () {
      await expect(
        placeNFT.connect(user1).setPlaceURI(tokenId, newUri, newHash)
      ).to.be.reverted;
    });
  });

  describe('Pausing', function () {
    const tokenId = 1001;
    const tokenUri = 'ipfs://QmTest123';
    const metadataHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    it('Should pause and unpause', async function () {
      await placeNFT.connect(pauser).pause();
      expect(await placeNFT.paused()).to.be.true;

      await placeNFT.connect(pauser).unpause();
      expect(await placeNFT.paused()).to.be.false;
    });

    it('Should revert minting when paused', async function () {
      await placeNFT.connect(pauser).pause();
      await expect(
        placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash)
      ).to.be.reverted;
    });

    it('Should revert claiming when paused', async function () {
      await placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash);
      await placeNFT.connect(pauser).pause();
      await expect(
        placeNFT.connect(minter).claimPlace(tokenId, user1.address)
      ).to.be.reverted;
    });

    it('Should revert if caller is not pauser', async function () {
      await expect(placeNFT.connect(user1).pause()).to.be.reverted;
    });
  });

  describe('Progress Events', function () {
    const tokenId = 1001;
    const pairNumber = 1;
    const sliceId = 101;

    it('Should emit SlicePurchased event', async function () {
      await expect(
        placeNFT.connect(minter).emitSlicePurchased(tokenId, pairNumber, sliceId, user1.address)
      )
        .to.emit(placeNFT, 'SlicePurchased')
        .withArgs(tokenId, pairNumber, sliceId, user1.address);
    });

    it('Should emit SlicePairCompleted event', async function () {
      await expect(
        placeNFT.connect(minter).emitSlicePairCompleted(tokenId, pairNumber, user1.address)
      )
        .to.emit(placeNFT, 'SlicePairCompleted')
        .withArgs(tokenId, pairNumber, user1.address);
    });

    it('Should revert if caller is not minter', async function () {
      await expect(
        placeNFT.connect(user1).emitSlicePurchased(tokenId, pairNumber, sliceId, user1.address)
      ).to.be.reverted;
    });
  });

  describe('View Functions', function () {
    const tokenId = 1001;
    const tokenUri = 'ipfs://QmTest123';
    const metadataHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    beforeEach(async function () {
      await placeNFT.connect(minter).mintPlace(tokenId, tokenUri, metadataHash);
    });

    it('Should return correct values for isPlaceMinted', async function () {
      expect(await placeNFT.isPlaceMinted(tokenId)).to.be.true;
      expect(await placeNFT.isPlaceMinted(9999)).to.be.false;
    });

    it('Should return correct values for isPlaceClaimed', async function () {
      expect(await placeNFT.isPlaceClaimed(tokenId)).to.be.false;
      await placeNFT.connect(minter).claimPlace(tokenId, user1.address);
      expect(await placeNFT.isPlaceClaimed(tokenId)).to.be.true;
    });

    it('Should return correct values for getPlaceClaimedBy', async function () {
      expect(await placeNFT.getPlaceClaimedBy(tokenId)).to.equal(ethers.ZeroAddress);
      await placeNFT.connect(minter).claimPlace(tokenId, user1.address);
      expect(await placeNFT.getPlaceClaimedBy(tokenId)).to.equal(user1.address);
    });

    it('Should return correct values for getPlaceMetadataHash', async function () {
      expect(await placeNFT.getPlaceMetadataHash(tokenId)).to.equal(metadataHash);
    });
  });

  describe('Interface Support', function () {
    it('Should support ERC1155 interface', async function () {
      // ERC1155 interface ID
      expect(await placeNFT.supportsInterface('0xd9b67a26')).to.be.true;
    });

    it('Should support AccessControl interface', async function () {
      // AccessControl interface ID
      expect(await placeNFT.supportsInterface('0x7965db0b')).to.be.true;
    });
  });
});
