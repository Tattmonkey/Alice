export interface GalleryItem {
  id: string;
  userId: string;
  imageUrl: string;
  title: string;
  description?: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  type: 'tattoo' | 'design' | 'inspiration';
  metadata?: {
    width: number;
    height: number;
    size: number;
    originalName: string;
  };
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
}

export interface GalleryFilter {
  type?: GalleryItem['type'];
  tags?: string[];
  userId?: string;
  isPublic?: boolean;
  sortBy?: 'recent' | 'popular' | 'likes';
}

export interface GalleryStats {
  totalItems: number;
  totalLikes: number;
  totalComments: number;
  popularTags: { tag: string; count: number }[];
  itemsByType: { [K in GalleryItem['type']]: number };
}

export interface GalleryContextType {
  items: GalleryItem[];
  userItems: GalleryItem[];
  loading: boolean;
  error: string | null;
  stats: GalleryStats | null;
  filter: GalleryFilter;
  uploadItem: (file: File, data: Partial<GalleryItem>) => Promise<string>;
  deleteItem: (itemId: string) => Promise<void>;
  updateItem: (itemId: string, data: Partial<GalleryItem>) => Promise<void>;
  likeItem: (itemId: string) => Promise<void>;
  unlikeItem: (itemId: string) => Promise<void>;
  addComment: (itemId: string, content: string) => Promise<void>;
  deleteComment: (itemId: string, commentId: string) => Promise<void>;
  setFilter: (filter: GalleryFilter) => void;
  refreshStats: () => Promise<void>;
}
