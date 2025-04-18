"use client";

import { CashuMint, CashuWallet, getDecodedToken } from "@cashu/cashu-ts";

const TEST_MINT_URL = "https://legend.lnbits.com/cashu/api/v1/4gr9Xcmz3XEkUNwiBiQGoC";

async function testCashuTransaction() {
  try {
    // Initialize mint and wallet
    const mint = new CashuMint(TEST_MINT_URL);
    const wallet = new CashuWallet(mint);

    // Get mint keys
    await wallet.requestMintKeys();

    // Request invoice for minting (10 sats)
    const { pr: invoice } = await wallet.requestMint(10);
    console.log("Invoice for minting:", invoice);

    // Wait for payment confirmation (simulated)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mint tokens
    const tokens = await wallet.mint(10);
    console.log("Minted tokens:", tokens);

    // Generate a test recipient key pair
    const recipientPrivateKey = "test-private-key";
    const recipientPublicKey = "test-public-key";

    // Lock tokens to recipient's pubkey
    const lockedTokens = await wallet.split(tokens, [{
      amount: 10,
      p2pk: recipientPublicKey
    }]);
    console.log("P2PK-locked tokens:", lockedTokens);

    // Verify tokens
    const decodedToken = getDecodedToken(JSON.stringify(lockedTokens));
    const isValid = await wallet.verify(decodedToken);
    console.log("Token verification:", isValid);

    // Redeem tokens
    if (isValid) {
      await wallet.redeem(decodedToken);
      console.log("Tokens redeemed successfully");
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testCashuTransaction();