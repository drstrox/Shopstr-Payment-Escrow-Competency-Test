"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContext } from "react";
import { ToastContext } from "./ui/toast-context";
import { requestProvider } from "webln";
import axios from "axios";

// LND REST API endpoint (should be configured properly in production)
const LND_API = "https://localhost:8080/v1";

export function HodlInvoices() {
  const [amount, setAmount] = useState("");
  const [invoice, setInvoice] = useState("");
  const [hash, setHash] = useState("");
  const [preimage, setPreimage] = useState("");
  const toastContext = useContext(ToastContext);

  const createHodlInvoice = async () => {
    try {
      if (!amount) {
        throw new Error("Please enter an amount");
      }

      // Try WebLN first
      try {
        const webln = await requestProvider();
        const response = await webln.makeInvoice({
          amount: parseInt(amount),
          defaultMemo: "HODL Invoice Test",
        });
        setInvoice(response.paymentRequest);
        setHash(response.paymentHash);
      } catch (weblnError) {
        // Fallback to LND REST API
        const response = await axios.post(`${LND_API}/invoices`, {
          value: amount,
          memo: "HODL Invoice Test",
          hodl: true,
        });
        setInvoice(response.data.payment_request);
        setHash(response.data.r_hash);
      }

      toastContext?.toast({
        title: "HODL invoice created",
        description: "Invoice has been generated successfully",
      });
    } catch (error) {
      toastContext?.toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const settleInvoice = async () => {
    try {
      if (!invoice || !hash) {
        throw new Error("No invoice to settle");
      }

      // In production, you would implement proper preimage handling
      const response = await axios.post(`${LND_API}/hodl/settle`, {
        payment_hash: hash,
        preimage: preimage,
      });

      toastContext?.toast({
        title: "Invoice settled",
        description: "The HODL invoice has been successfully settled",
      });

      setInvoice("");
      setHash("");
      setPreimage("");
    } catch (error) {
      toastContext?.toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Poll for invoice status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (hash) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${LND_API}/invoice/${hash}`);
          if (response.data.settled) {
            setPreimage(response.data.r_preimage);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error polling invoice status:", error);
        }
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [hash]);

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

      {invoice ? (
        <div className="space-y-2">
          <Label>HODL Invoice</Label>
          <div className="p-4 bg-muted rounded-lg break-all">
            <code>{invoice}</code>
          </div>
          {preimage && (
            <div className="space-y-2">
              <Label>Preimage</Label>
              <div className="p-4 bg-muted rounded-lg break-all">
                <code>{preimage}</code>
              </div>
            </div>
          )}
          <Button onClick={settleInvoice} className="w-full" disabled={!preimage}>
            Settle Invoice
          </Button>
        </div>
      ) : (
        <Button onClick={createHodlInvoice} className="w-full">
          Create HODL Invoice
        </Button>
      )}
    </div>
  );
}