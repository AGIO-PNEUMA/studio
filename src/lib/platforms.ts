import type { LucideIcon } from 'lucide-react';
import { FacebookIcon } from '@/components/icons/FacebookIcon';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { TwitterIcon } from '@/components/icons/TwitterIcon';
import { YoutubeIcon } from '@/components/icons/YoutubeIcon';
import { TiktokIcon } from '@/components/icons/TiktokIcon';
import { LinkedInIcon } from '@/components/icons/LinkedInIcon';
import { Globe, Search } from 'lucide-react';

export interface Platform {
  id: string;
  name: string;
  Icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  searchUrlPatterns: ((query: string) => string)[];
  themeColor?: string; // Optional: for platform-specific theming if needed
}

export const platforms: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    Icon: InstagramIcon,
    searchUrlPatterns: [
      (query) => `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(query)}`,
      (query) => `https://www.instagram.com/${encodeURIComponent(query.replace(/\s+/g, ''))}/`, // Direct username attempt
    ],
    themeColor: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    Icon: FacebookIcon,
    searchUrlPatterns: [
      (query) => `https://www.facebook.com/search/people/?q=${encodeURIComponent(query)}`,
    ],
    themeColor: 'bg-blue-600',
  },
  {
    id: 'x-twitter',
    name: 'X (Twitter)',
    Icon: TwitterIcon,
    searchUrlPatterns: [
      (query) => `https://x.com/search?q=${encodeURIComponent(query)}&f=user`,
    ],
    themeColor: 'bg-black',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    Icon: YoutubeIcon,
    searchUrlPatterns: [
      (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      (query) => `https://www.youtube.com/@${encodeURIComponent(query.replace(/\s+/g, ''))}`, // Handle attempt
    ],
    themeColor: 'bg-red-600',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    Icon: TiktokIcon,
    searchUrlPatterns: [
      (query) => `https://www.tiktok.com/search/user?q=${encodeURIComponent(query)}`,
      (query) => `https://www.tiktok.com/@${encodeURIComponent(query.replace(/\s+/g, ''))}`, // Direct username attempt
    ],
    themeColor: 'bg-black', // TikTok often uses black/white/accent colors
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    Icon: LinkedInIcon,
    searchUrlPatterns: [
      (query) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`,
    ],
    themeColor: 'bg-sky-700',
  },
  // Add more platforms here to reach "20 platforms"
  // Example for generic platforms:
  {
    id: 'pinterest',
    name: 'Pinterest',
    Icon: Globe, // Replace with PinterestIcon if available or created
    searchUrlPatterns: [
      (query) => `https://www.pinterest.com/search/users/?q=${encodeURIComponent(query)}`,
    ],
  },
  {
    id: 'reddit',
    name: 'Reddit (User Search)',
    Icon: Globe, // Replace with RedditIcon if available or created
    searchUrlPatterns: [
      (query) => `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&type=user`, // More specific user search
      (query) => `https://www.reddit.com/user/${encodeURIComponent(query.replace(/\s+/g, ''))}/`, // Direct profile attempt
    ],
  },
  {
    id: 'threads',
    name: 'Threads',
    Icon: Search,
    searchUrlPatterns: [
        (query) => `https://www.threads.net/${encodeURIComponent(query.replace(/\s+/g, ''))}`,
    ],
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    Icon: Search,
    searchUrlPatterns: [
        (query) => `https://www.snapchat.com/add/${encodeURIComponent(query.replace(/\s+/g, ''))}`,
    ],
  },
  // ... add more platforms up to 20, using Globe or Search as placeholder icons
  // It is recommended to create specific icons for better UX for each platform.
];

export const ALL_PLATFORM_IDS = platforms.map(p => p.id);
