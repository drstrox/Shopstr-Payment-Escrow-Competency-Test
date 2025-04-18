"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContext } from "react";
import { ToastContext } from "./ui/toast-context";
import { CashuMint, CashuWallet, getDecodedToken } from "@cashu/cashu-ts";

const TEST_MINT_URL = "https://legend.lnbits.com/cashu/api/v1/4gr9Xcmz3XEkUNwiBiQGoC";

export function CashuTokens() {
  const [amount, setAmount] = useState("");
  const [recipientPubkey, setRecipientPubkey] = useState("");
  const [token, setToken] = useState("");
  const toastContext = useContext(ToastContext);

  const mintToken = async () => {
    try {
      if (!amount || !recipientPubkey) {
        throw new Error("Please enter amount and recipient's public key");
      }

      const mint = new CashuMint(TEST_MINT_URL);
      const wallet = new CashuWallet(mint);

      // Get mint keys
      await wallet.requestMintKeys();

      // Request invoice for minting
      const { pr: invoice } = await wallet.requestMint(parseInt(amount));

      // In a real app, you would wait for the invoice to be paid
      // For testing, we'll simulate payment confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mint tokens
      const tokens = await wallet.mint(parseInt(amount));

      // Lock tokens to recipient's pubkey
      const lockedTokens = await wallet.split(tokens, [{
        amount: parseInt(amount),
        p2pk: recipientPubkey
      }]);

      setToken(JSON.stringify(lockedTokens));
      
      toastContext?.toast({
        title: "Token minted",
        description: "P2PK-locked token has been created",
      });
    } catch (error) {
      toastContext?.toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const spendToken = async () => {
    try {
      if (!token) {
        throw new Error("No token to spend");
      }

      const mint = new CashuMint(TEST_MINT_URL);
      const wallet = new CashuWallet(mint);

      // Get mint keys
      await wallet.requestMintKeys();

      // Decode the token
      const decodedToken = getDecodedToken(token);

      // Verify P2PK condition
      const isValid = await wallet.verify(decodedToken);
      if (!isValid) {
        throw new Error("Invalid token");
      }

      // Redeem token
      await wallet.redeem(decodedToken);

      toastContext?.toast({
        title: "Token spent",
        description: "The token has been successfully spent",
      });

      setToken("");
    } catch (error) {
      toastContext?.toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (sats)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in sats"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipientPubkey">Recipient's Public Key</Label>
        <Input
          id="recipientPubkey"
          value={recipientPubkey}
          onChange={(e) => setRecipientPubkey(e.target.value)}
          placeholder="Recipient's public key (hex)"
        />
      </div>

      {token ? (
        <div className="space-y-2">
          <Label>Token</Label>
          <div className="p-4 bg-muted rounded-lg break-all">
            <code>{token}</code>
          </div>
          <Button onClick={spendToken} className="w-full">
            Spend Token
          </Button>
        </div>
      ) : (
        <Button onClick={mintToken} className="w-full">
          Mint P2PK Token
        </Button>
      )}
    </div>
  );
}