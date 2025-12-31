"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface SignalsFiltersProps {
  sectors: string[];
}

export function SignalsFilters({ sectors }: SignalsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sector, setSector] = useState(searchParams.get("sector") || "all");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sector && sector !== "all") params.set("sector", sector);
    router.push(`/signals?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Filter signals by sector or search by symbol</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by symbol or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            />
          </div>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleFilter}>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}

