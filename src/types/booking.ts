export interface Booking {
  id: string;
  artistId: string;
  userId: string;
  serviceId: string;
  status: BookingStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  price: number;
  deposit: number;
  depositPaid: boolean;
  notes?: string;
  reference?: string;
  attachments?: BookingAttachment[];
  consultation?: ConsultationDetails;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface BookingAttachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface ConsultationDetails {
  required: boolean;
  completed: boolean;
  scheduledFor?: string;
  notes?: string;
  outcome?: 'approved' | 'rejected' | 'needs_changes';
  changes?: string;
}

export interface ArtistService {
  id: string;
  artistId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  deposit: number;
  requiresConsultation: boolean;
  maxBookingsPerDay?: number;
  category: ServiceCategory;
  images?: string[];
  active: boolean;
}

export type ServiceCategory = 
  | 'tattoo'
  | 'piercing'
  | 'consultation'
  | 'touchup'
  | 'custom';

export interface WorkingHours {
  day: number; // 0-6, 0 is Sunday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface CustomTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ArtistAvailability {
  id: string;
  artistId: string;
  regularHours: WorkingHours[];
  blockedDates: string[];
  customAvailability: CustomTimeSlot[];
  maxBookings?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  existingBooking?: Booking;
}

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
  isAvailable: boolean;
  totalBookings: number;
}

export interface BookingFilter {
  status?: BookingStatus[];
  startDate?: string;
  endDate?: string;
  artistId?: string;
  userId?: string;
  serviceId?: string;
}

export interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShows: number;
  totalRevenue: number;
  averageRating: number;
  popularServices: {
    serviceId: string;
    name: string;
    bookings: number;
  }[];
  bookingsByStatus: {
    [K in BookingStatus]: number;
  };
  bookingsByMonth: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
}

export interface BookingContextType {
  bookings: Booking[];
  artistServices: ArtistService[];
  availability: ArtistAvailability[];
  loading: boolean;
  error: string | null;
  stats: BookingStats | null;
  createBooking: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBooking: (bookingId: string, data: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  getArtistAvailability: (artistId: string, startDate: string, endDate: string) => Promise<DaySchedule[]>;
  createService: (data: Omit<ArtistService, 'id'>) => Promise<string>;
  updateService: (serviceId: string, data: Partial<ArtistService>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  updateAvailability: (availabilityId: string, data: Partial<ArtistAvailability>) => Promise<void>;
  addAttachment: (bookingId: string, file: File) => Promise<void>;
  removeAttachment: (bookingId: string, attachmentId: string) => Promise<void>;
  getBookingStats: (filter?: BookingFilter) => Promise<BookingStats>;
  refreshStats: () => Promise<void>;
}
