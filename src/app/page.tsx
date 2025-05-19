
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
  const [isQueryExpanded, setIsQueryExpanded] = useState<boolean>(false); // True if AI expansion has happened
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
    setIsQueryExpanded(false);
    setSearchResults([]);
    setError(null);

    try {
      toast({
        title: "Expanding Search Query...",
        description: "Using AI to find variations of your search term.",
      });
      const aiInput: ExpandSearchQueryInput = { query: trimmedSearchTerm };
      const aiOutput: ExpandSearchQueryOutput = await expandSearchQuery(aiInput);
      setIsQueryExpanded(true); // Mark that AI expansion has occurred

      // AI expansion is performed to inform the user, but its results are not used for link generation.
      // Links will only be generated for the original (trimmed) search term.
      
      if (aiOutput && aiOutput.expandedQueries && aiOutput.expandedQueries.length > 0) {
         toast({
            title: "Query Expansion Complete!",
            description: `AI found ${aiOutput.expandedQueries.length} potential variations. Searching with your original term: "${trimmedSearchTerm}".`,
         });
      } else {
         toast({
            title: "Query Expansion Note",
            description: `No variations found by AI. Searching with your original term: "${trimmedSearchTerm}".`,
         });
      }
      
      const results: SearchResultItem[] = [];
      const platformsToSearch = allPlatforms.filter(p => selectedPlatforms.has(p.id));

      for (const platform of platformsToSearch) {
        const platformLinks: SearchResultItem['links'] = [];
        
        // Generate links ONLY for the trimmedSearchTerm
        platform.searchUrlPatterns.forEach(patternFn => {
          platformLinks.push({
            url: patternFn(trimmedSearchTerm),
            queryText: trimmedSearchTerm, // This will be the original (trimmed) searchTerm
            isDirectAttempt: patternFn(trimmedSearchTerm).includes(`/${encodeURIComponent(trimmedSearchTerm.replace(/\s+/g, ''))}`), 
          });
        });
        
        // Deduplicate links by URL for the same platform
        const uniqueLinks = Array.from(new Map(platformLinks.map(link => [link.url, link])).values());
        
        // Only add platform to results if there are any links for it.
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
  
  // Effect to clear results if search term is empty
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError(null);
      setIsQueryExpanded(false);
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
            isQueryExpanded={isQueryExpanded}
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
