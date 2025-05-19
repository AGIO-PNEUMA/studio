'use client';

import type { Platform } from '@/lib/platforms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ListFilter, CheckSquare, Square } from 'lucide-react';
import React from 'react';

interface SearchControlsProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  platforms: Platform[];
  selectedPlatforms: Set<string>;
  onPlatformToggle: (platformId: string) => void;
  onSelectAllPlatforms: () => void;
  onDeselectAllPlatforms: () => void;
}

export function SearchControls({
  searchTerm,
  onSearchTermChange,
  onSearch,
  isSearching,
  platforms,
  selectedPlatforms,
  onPlatformToggle,
  onSelectAllPlatforms,
  onDeselectAllPlatforms,
}: SearchControlsProps) {
  
  const allSelected = platforms.length > 0 && selectedPlatforms.size === platforms.length;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Search className="mr-2 h-6 w-6 text-primary" />
            Search Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchTerm" className="text-base">Name or Username</Label>
              <Input
                id="searchTerm"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="e.g., john doe or johndoe123"
                className="mt-1 text-base"
                disabled={isSearching}
              />
            </div>
            <Button onClick={onSearch} disabled={isSearching || !searchTerm.trim()} className="w-full text-lg py-6">
              {isSearching ? 'Searching...' : 'Search Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <ListFilter className="mr-2 h-6 w-6 text-primary" />
            Select Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex space-x-2">
            <Button variant="outline" onClick={onSelectAllPlatforms} disabled={isSearching}>
              <CheckSquare className="mr-2 h-4 w-4" /> Select All
            </Button>
            <Button variant="outline" onClick={onDeselectAllPlatforms} disabled={isSearching}>
              <Square className="mr-2 h-4 w-4" /> Deselect All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <platform.Icon className="h-6 w-6" aria-hidden="true" />
                  <Label htmlFor={`platform-${platform.id}`} className="text-base cursor-pointer">
                    {platform.name}
                  </Label>
                </div>
                <Switch
                  id={`platform-${platform.id}`}
                  checked={selectedPlatforms.has(platform.id)}
                  onCheckedChange={() => onPlatformToggle(platform.id)}
                  disabled={isSearching}
                  aria-label={`Toggle search on ${platform.name}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
