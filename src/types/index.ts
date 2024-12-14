// Base Types
export interface User {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  credits: number;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isEmailVerified: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  bookingUpdates: boolean;
  marketingEmails: boolean;
}

export type UserRole = {
  type: 'user' | 'artist' | 'admin';
  artistProfileId?: string;
  permissions?: string[];
};

// Artist Related Types
export interface ArtistProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  specialties: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  portfolio: PortfolioItem[];
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  completedBookings: number;
  status: 'active' | 'inactive' | 'pending_review';
  availability: ArtistAvailability;
  location?: Location;
  socialLinks?: SocialLinks;
  certificates?: Certificate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  createdAt: Date;
}

export interface ArtistAvailability {
  regularHours: WorkingHours[];
  blockedDates: Date[];
  customAvailability: CustomTimeSlot[];
  timezone: string;
}

export interface WorkingHours {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string;
  isAvailable: boolean;
}

export interface CustomTimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  imageUrl?: string;
}

// Booking Related Types
export interface Booking {
  id: string;
  userId: string;
  artistId: string;
  userName: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  payment?: PaymentDetails;
  requirements?: string[];
  attachments?: string[];
  messages?: BookingMessage[];
  rating?: BookingRating;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'completed' 
  | 'cancelled' 
  | 'in_progress' 
  | 'payment_pending';

export interface BookingMessage {
  id: string;
  senderId: string;
  content: string;
  attachments?: string[];
  createdAt: Date;
  readAt?: Date;
}

export interface BookingRating {
  rating: number;
  review: string;
  createdAt: Date;
  response?: {
    content: string;
    createdAt: Date;
  };
}

// Product Related Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  category: string;
  subcategory?: string;
  featured: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
  tags: string[];
  specifications?: Record<string, string>;
  reviews: ProductReview[];
  averageRating: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
  images?: string[];
  helpful: number;
  response?: {
    content: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Order Related Types
export interface Order {
  id: string;
  userId: string;
  artistId?: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: ShippingDetails;
  billing: BillingDetails;
  payment: PaymentDetails;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded' 
  | 'on_hold';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  sku: string;
}

// Payment Related Types
export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  provider: string;
  receiptUrl?: string;
  refundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'paypal' 
  | 'bank_transfer' 
  | 'crypto';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled';

// Location and Address Types
export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ShippingDetails extends Location {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

export interface BillingDetails extends Location {
  name: string;
  email: string;
  phone?: string;
}

// Social Media Types
export interface SocialLinks {
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'booking_update' 
  | 'order_update' 
  | 'payment_update' 
  | 'system_message' 
  | 'promotion';
