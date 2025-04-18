"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Lock, Zap } from "lucide-react";
import { NostrMessaging } from "@/components/nostr-messaging";
import { CashuTokens } from "@/components/cashu-tokens";
import { HodlInvoices } from "@/components/hodl-invoices";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Nostr Cashu App</h1>
          <p className="text-muted-foreground text-lg">
            Send gift-wrapped messages with Cashu tokens and HODL invoices
          </p>
        </div>

        <Tabs defaultValue="nostr" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="nostr" className="space-x-2">
              <Gift className="w-4 h-4" />
              <span>Nostr</span>
            </TabsTrigger>
            <TabsTrigger value="cashu" className="space-x-2">
              <Lock className="w-4 h-4" />
              <span>Cashu</span>
            </TabsTrigger>
            <TabsTrigger value="hodl" className="space-x-2">
              <Zap className="w-4 h-4" />
              <span>HODL</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nostr">
            <Card>
              <CardHeader>
                <CardTitle>Gift-Wrapped Messages (NIP-17)</CardTitle>
                <CardDescription>
                  Send encrypted messages that only the recipient can decrypt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NostrMessaging />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashu">
            <Card>
              <CardHeader>
                <CardTitle>P2PK-Locked Cashu Tokens</CardTitle>
                <CardDescription>
                  Create and spend tokens locked to specific public keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CashuTokens />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hodl">
            <Card>
              <CardHeader>
                <CardTitle>HODL Invoices</CardTitle>
                <CardDescription>
                  Create and manage conditional Lightning payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HodlInvoices />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}