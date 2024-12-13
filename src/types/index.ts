export interface User {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = {
  type: 'user' | 'artist' | 'admin';
  artistProfileId?: string;
};

export interface ArtistProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  specialties: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  portfolio: string[];
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  completedBookings: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  artistId: string;
  userName: string;
  description: string;
  date: Date;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  artistId?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
