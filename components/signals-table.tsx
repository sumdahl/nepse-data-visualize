"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import type { TradingSignal } from "@/lib/db/schema";

interface SignalsTableProps {
  signals: TradingSignal[];
}

function getSummaryColor(summary: string | null) {
  if (!summary) return "secondary";
  if (summary.includes("Strong Bullish")) return "default";
  if (summary.includes("Bullish")) return "secondary";
  if (summary.includes("Bearish")) return "destructive";
  return "outline";
}

function getRiskColor(risk: string | null) {
  if (!risk) return "secondary";
  if (risk.includes("High")) return "destructive";
  if (risk.includes("Medium")) return "default";
  return "secondary";
}

function parseGain(gain: string | null): number {
  if (!gain) return 0;
  return parseFloat(gain.replace("%", "")) || 0;
}

export function SignalsTable({ signals }: SignalsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Signals</CardTitle>
        <CardDescription>Complete list of trading signals ({signals.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>LTP</TableHead>
                <TableHead>Daily Gain</TableHead>
                <TableHead>Technical Summary</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>RSI</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((signal) => {
                const gain = parseGain(signal.dailyGain);
                return (
                  <TableRow key={signal.id}>
                    <TableCell className="font-bold">{signal.symbol}</TableCell>
                    <TableCell>{signal.sector || "N/A"}</TableCell>
                    <TableCell>Rs. {signal.ltp || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {gain > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : gain < 0 ? (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span
                          className={
                            gain > 0
                              ? "text-green-600 font-medium"
                              : gain < 0
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {signal.dailyGain || "0%"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSummaryColor(signal.technicalSummary)}>
                        {signal.technicalSummary || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskColor(signal.technicalEntryRisk)}>
                        {signal.technicalEntryRisk || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{signal.rsi14 || "N/A"}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{signal.symbol} - Full Details</DialogTitle>
                            <DialogDescription>Complete trading signal information</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Sector</p>
                                <p className="text-sm">{signal.sector || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">LTP</p>
                                <p className="text-sm font-bold">Rs. {signal.ltp || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Daily Gain</p>
                                <p className="text-sm font-bold">{signal.dailyGain || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Volatility</p>
                                <p className="text-sm">{signal.dailyVolatility || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Technical Summary</p>
                                <Badge variant={getSummaryColor(signal.technicalSummary)}>
                                  {signal.technicalSummary || "N/A"}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Entry Risk</p>
                                <Badge variant={getRiskColor(signal.technicalEntryRisk)}>
                                  {signal.technicalEntryRisk || "N/A"}
                                </Badge>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3">Technical Indicators</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">RSI 14</p>
                                  <p className="text-sm">{signal.rsi14 || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">MACD</p>
                                  <p className="text-sm">{signal.macdVsSignalLine || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">MFI 14</p>
                                  <p className="text-sm">{signal.mfi14 || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">StochRSI</p>
                                  <p className="text-sm">{signal.stochRSI || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">%B</p>
                                  <p className="text-sm">{signal.percentB || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">3M Trend</p>
                                  <p className="text-sm">{signal.trend3M || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3">Moving Averages</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">10 SMA</p>
                                  <p className="text-sm">{signal.sma10 || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Price vs 20 SMA</p>
                                  <p className="text-sm">{signal.priceAbove20SMA || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Price vs 50 SMA</p>
                                  <p className="text-sm">{signal.priceAbove50SMA || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Price vs 200 SMA</p>
                                  <p className="text-sm">{signal.priceAbove200SMA || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

