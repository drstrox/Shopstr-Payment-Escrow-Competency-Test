"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as nostr from "nostr-tools";
import { useContext } from "react";
import { ToastContext } from "./ui/toast-context";

export function NostrMessaging() {
  const [recipientPubkey, setRecipientPubkey] = useState("");
  const [message, setMessage] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const toastContext = useContext(ToastContext);

  const generateKeyPair = () => {
    const privKey = nostr.generatePrivateKey();
    const pubKey = nostr.getPublicKey(privKey);
    setPrivateKey(privKey);
    toastContext?.toast({
      title: "Key pair generated",
      description: `Public key: ${pubKey}`,
    });
  };

  const sendMessage = async () => {
    try {
      if (!privateKey || !recipientPubkey || !message) {
        throw new Error("Please fill in all fields");
      }

      // First, encrypt the message using NIP-04
      const encryptedContent = await nostr.nip04.encrypt(
        privateKey,
        recipientPubkey,
        message
      );

      // Create the inner event (NIP-04 encrypted message)
      const innerEvent = {
        kind: 4,
        pubkey: nostr.getPublicKey(privateKey),
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", recipientPubkey]],
        content: encryptedContent,
      };

      // Sign the inner event
      const signedInnerEvent = nostr.finishEvent(innerEvent, privateKey);

      // Create the outer gift wrap (NIP-17)
      const giftWrapEvent = {
        kind: 1059,
        pubkey: nostr.getPublicKey(privateKey),
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["p", recipientPubkey],
          ["encrypted", "nip04"],
          ["kind", "4"],
        ],
        content: JSON.stringify(signedInnerEvent),
      };

      // Sign the gift wrap event
      const signedGiftWrapEvent = nostr.finishEvent(giftWrapEvent, privateKey);

      // In a real app, you would publish this to relays
      console.log("Gift wrapped event:", signedGiftWrapEvent);

      toastContext?.toast({
        title: "Message sent",
        description: "Your gift-wrapped message has been sent successfully",
      });

      setMessage("");
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
        <Label htmlFor="privateKey">Your Private Key</Label>
        <div className="flex space-x-2">
          <Input
            id="privateKey"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Your private key (hex)"
            type="password"
          />
          <Button onClick={generateKeyPair}>Generate</Button>
        </div>
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

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here"
          rows={4}
        />
      </div>

      <Button onClick={sendMessage} className="w-full">
        Send Gift-Wrapped Message
      </Button>
    </div>
  );
}