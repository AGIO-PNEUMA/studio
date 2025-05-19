import { Eye } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-center mb-2">
        <Eye className="h-12 w-12 text-primary" />
        <h1 className="ml-3 text-5xl font-bold tracking-tight text-primary">
          SocialEye
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Discover profiles across popular social media platforms with AI-powered search expansion.
      </p>
    </header>
  );
}
