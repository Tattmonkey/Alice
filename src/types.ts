export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  cart: CartItem[];
  creations: Creation[];
  bookings: Booking[];
  role: UserRole | null;
  avatar?: string;
  lastSeen?: string;
  isOnline?: boolean;
  unreadMessages?: number;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageSound: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface Creation {
  id: string;
  prompt: string;
  result: string;
  timestamp: string;
  type: 'text' | 'image';
}

export interface Booking {
  id: string;
  artistId: string;
  userId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  price: number;
}

export interface UserRole {
  type: 'admin' | 'artist' | 'user';
  verified?: boolean;
  createdAt: string;
  permissions?: string[];
}

export interface ArtistProfile extends User {
  role: {
    type: 'artist';
    verified: boolean;
    createdAt: string;
  };
  bio?: string;
  specialties?: string[];
  portfolio?: PortfolioItem[];
  availability?: Availability[];
  rating?: number;
  reviews?: Review[];
  location?: Location;
  socialLinks?: SocialLinks;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
}

export interface Availability {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  booked: boolean;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}
