'use client';

import type { Platform } from '@/lib/platforms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, AlertCircle, Info, Loader2, SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultLink {
  url: string;
  queryText: string;
  isDirectAttempt?: boolean;
}
export interface SearchResultItem {
  platform: Platform;
  links: SearchResultLink[];
}

interface SearchResultsDisplayProps {
  results: SearchResultItem[];
  isSearching: boolean;
  aiExpansionAttempted: boolean; // Renamed from isQueryExpanded
  error: string | null;
  searchTerm: string;
}

export function SearchResultsDisplay({
  results,
  isSearching,
  aiExpansionAttempted, // Using the renamed prop
  error,
  searchTerm,
}: SearchResultsDisplayProps) {
  // Show loader if actively searching OR if AI attempt was made, search term exists, but no results/error yet
  if (isSearching || (searchTerm && aiExpansionAttempted && results.length === 0 && !error) ) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            {isSearching ? "Searching..." : "Processing..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {/* Updated text based on whether AI expansion was part of the process */}
            {aiExpansionAttempted && isSearching ? "Finalizing results after AI processing..." : 
             isSearching ? "Fetching results..." : 
             "Preparing your results..."}
          </p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Search Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!searchTerm) {
     return (
      <Card className="shadow-lg">
        <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-12">
                <Info className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Search?</h3>
                <p className="text-muted-foreground">
                Enter a name or username and select platforms to begin your search.
                </p>
            </div>
        </CardContent>
      </Card>
     );
  }
  
  // This condition will hit if not searching, no error, search term exists, but results are empty.
  // This implies the search finished with no results.
  if (results.length === 0 && searchTerm && !isSearching) {
    return (
      <Card className="shadow-lg">
        <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-12">
                <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                We couldn't find any results for "{searchTerm}" on the selected platforms. Try a different name or check your spelling.
                </p>
            </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Search Results for "{searchTerm}"</h2>
      {results.map(({ platform, links }) => (
        <Card key={platform.id} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <platform.Icon className="mr-3 h-7 w-7" />
              {platform.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {links.length > 0 ? (
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-accent-foreground hover:text-accent hover:underline transition-colors group bg-secondary/50 hover:bg-secondary/80 p-3 rounded-md"
                    >
                      <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
                      <span className="truncate">
                        {link.isDirectAttempt ? `Direct profile attempt for: ` : `Search for: `} 
                        <span className="font-semibold">{link.queryText}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No specific links generated for this platform with the given queries. You might try a manual search.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
