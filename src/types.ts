// Add to existing types.ts
export interface DownloadableProduct extends Product {
  isDownloadable: boolean;
  downloadUrl?: string;
  downloadLimit?: number;
  fileSize?: string;
  fileType?: string;
}

export interface UserDownload {
  id: string;
  productId: string;
  purchaseDate: string;
  downloadCount: number;
  lastDownloadDate?: string;
  expiryDate?: string;
}

// Update User interface
export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  cart: CartItem[];
  creations: Creation[];
  bookings: Booking[];
  role: UserRole | null;
  downloads?: UserDownload[];
}