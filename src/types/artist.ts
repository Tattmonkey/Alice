export interface ArtistProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  specialties: string[];
  experience: string;
  portfolio: PortfolioItem[];
  availability: AvailabilitySchedule;
  pricing: PricingInfo;
  rating: number;
  reviewCount: number;
  contactInfo: ContactInfo;
  socialMedia: SocialMediaLinks;
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  likes: number;
}

export interface AvailabilitySchedule {
  weeklySchedule: {
    [key: string]: TimeSlot[]; // Monday, Tuesday, etc.
  };
  specialDates: {
    [date: string]: TimeSlot[]; // For specific dates
  };
  blockedDates: string[]; // Dates when artist is not available
}

export interface TimeSlot {
  start: string;
  end: string;
  isBooked: boolean;
  bookingId?: string;
}

export interface PricingInfo {
  hourlyRate: number;
  minimumBookingTime: number; // in hours
  depositPercentage: number;
  customPricing?: {
    [key: string]: number; // For specific types of work
  };
}

export interface ContactInfo {
  email: string;
  phone?: string;
  preferredContact: 'email' | 'phone' | 'both';
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

export interface ArtistBooking {
  id: string;
  artistId: string;
  clientId: string;
  dateTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  depositPaid: boolean;
  totalAmount: number;
  depositAmount: number;
  designDetails: {
    description: string;
    referenceImages: string[];
    size: string;
    placement: string;
    style: string;
    colors: boolean;
  };
  clientNotes?: string;
  artistNotes?: string;
}
