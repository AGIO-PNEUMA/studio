
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { SearchControls } from '@/components/SearchControls';
import { SearchResultsDisplay, type SearchResultItem } from '@/components/SearchResultsDisplay';
import { platforms as allPlatforms, ALL_PLATFORM_IDS, type Platform } from '@/lib/platforms';
import { expandSearchQuery, type ExpandSearchQueryInput, type ExpandSearchQueryOutput } from '@/ai/flows/expand-search-query';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

export default function SocialEyePage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(ALL_PLATFORM_IDS));
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [aiExpansionAttemptProcessed, setAiExpansionAttemptProcessed] = useState<boolean>(false); // True after AI expansion attempt (success or skip)
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePlatformToggle = useCallback((platformId: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
      }
      return next;
    });
  }, []);

  const handleSelectAllPlatforms = useCallback(() => {
    setSelectedPlatforms(new Set(ALL_PLATFORM_IDS));
  }, []);

  const handleDeselectAllPlatforms = useCallback(() => {
    setSelectedPlatforms(new Set());
  }, []);

  const handleSearch = async () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) {
      setError('Please enter a name or username to search.');
      return;
    }
    if (selectedPlatforms.size === 0) {
      setError('Please select at least one platform to search.');
      return;
    }

    setIsSearching(true);
    setAiExpansionAttemptProcessed(false); // Reset before new search
    setSearchResults([]);
    setError(null);

    try {
      toast({
        title: "Starting Search...",
        description: "Checking for AI-powered query enhancements...",
      });
      const aiInput: ExpandSearchQueryInput = { query: trimmedSearchTerm };
      const aiOutput: ExpandSearchQueryOutput = await expandSearchQuery(aiInput);
      setAiExpansionAttemptProcessed(true); 

      if (aiOutput.aiExpansionPerformed && aiOutput.expandedQueries.length > 0) {
         toast({
            title: "AI Query Expansion Successful!",
            description: `AI found ${aiOutput.expandedQueries.length} potential variations. Now searching with your original term: "${trimmedSearchTerm}".`,
         });
      } else if (!aiOutput.aiExpansionPerformed && aiOutput.aiExpansionSkippedReason === "API_KEY_MISSING") {
         toast({
            title: "AI Query Expansion Skipped",
            description: `AI features are unavailable (API key not configured). Proceeding with original term: "${trimmedSearchTerm}".`,
         });
      } else if (!aiOutput.aiExpansionPerformed) {
         toast({
            title: "AI Query Expansion Notice",
            description: `AI query expansion could not be performed. Proceeding with original term: "${trimmedSearchTerm}".`,
         });
      } else { // AI performed, but no new queries found
         toast({
            title: "AI Query Expansion Complete",
            description: `No additional variations found by AI. Searching with your original term: "${trimmedSearchTerm}".`,
         });
      }
      
      const results: SearchResultItem[] = [];
      const platformsToSearch = allPlatforms.filter(p => selectedPlatforms.has(p.id));

      for (const platform of platformsToSearch) {
        const platformLinks: SearchResultItem['links'] = [];
        
        platform.searchUrlPatterns.forEach(patternFn => {
          platformLinks.push({
            url: patternFn(trimmedSearchTerm),
            queryText: trimmedSearchTerm, 
            isDirectAttempt: patternFn(trimmedSearchTerm).includes(`/${encodeURIComponent(trimmedSearchTerm.replace(/\s+/g, ''))}`), 
          });
        });
        
        const uniqueLinks = Array.from(new Map(platformLinks.map(link => [link.url, link])).values());
        
        if (uniqueLinks.length > 0) {
          results.push({ platform, links: uniqueLinks });
        }
      }
      
      setSearchResults(results);
      if (results.length === 0 || results.every(r => r.links.length === 0)) {
         toast({
            title: "Search Complete",
            description: "No direct links found. Try refining your search.",
            variant: "default",
         });
      } else {
        toast({
            title: "Search Complete!",
            description: "Results are displayed below.",
        });
      }

    } catch (e) {
      console.error('Search failed:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during search.';
      setError(`Search failed: ${errorMessage}`);
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError(null);
      setAiExpansionAttemptProcessed(false);
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <AppHeader />
      <Separator className="my-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <SearchControls
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSearch={handleSearch}
            isSearching={isSearching}
            platforms={allPlatforms}
            selectedPlatforms={selectedPlatforms}
            onPlatformToggle={handlePlatformToggle}
            onSelectAllPlatforms={handleSelectAllPlatforms}
            onDeselectAllPlatforms={handleDeselectAllPlatforms}
          />
        </div>
        <div className="md:col-span-2">
          <SearchResultsDisplay
            results={searchResults}
            isSearching={isSearching}
            aiExpansionAttempted={aiExpansionAttemptProcessed}
            error={error}
            searchTerm={searchTerm.trim()} 
          />
        </div>
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SocialEye. All rights reserved.</p>
        <p className="mt-1">
          SocialEye is a web application for discovering public profiles. Please use responsibly.
        </p>
      </footer>
    </div>
  );
}
