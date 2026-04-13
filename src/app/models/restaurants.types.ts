/**
 * Restaurant and restaurant-related types
 */

import type { Timestamped } from './common.types';

/**
 * Restaurant status enumeration
 */
export enum RestaurantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

/**
 * Restaurant verification status
 */
export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

/**
 * Cuisine types
 */
export enum CuisineType {
  ARGENTINA = 'Argentina',
  ITALIANA = 'Italiana',
  PARRILLA = 'Parrilla',
  PIZZERIA = 'Pizzeria',
  COMIDA_RAPIDA = 'Comida Rápida',
  VEGETARIANA = 'Vegetariana',
  VEGANA = 'Vegana',
  ASIATICA = 'Asiática',
  MEXICANA = 'Mexicana',
  ESPAÑOLA = 'Española',
  FRANCESA = 'Francesa',
  JAPONESA = 'Japonesa',
  CHINA = 'China',
  INDIA = 'India',
  TAILANDESA = 'Tailandesa',
  PERUANA = 'Peruana',
  COLOMBIANA = 'Colombiana',
  BRASILEÑA = 'Brasileña',
  AMERICANA = 'Americana',
  INTERNACIONAL = 'Internacional',
  CAFETERIA = 'Cafetería',
  POSTRES = 'Postres',
  BARES = 'Bares',
}

/**
 * Price range
 */
export enum PriceRange {
  $ = '$',
  $$ = '$$',
  $$$ = '$$$',
  $$$$ = '$$$$',
}

/**
 * Restaurant entity
 */
export interface Restaurant extends Timestamped {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cuisine: CuisineType;
  priceRange: PriceRange;
  coverImage?: string;
  images?: string[];

  // Location
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Contact
  phone?: string;
  email?: string;
  website?: string;

  // Schedule
  schedule?: OpeningHours[];

  // Owner
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;

  // Status
  status: RestaurantStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: string; // Admin user ID
  rejectionReason?: string;

  // Stats
  rating: number; // 0-5
  reviewCount: number;
  photoCount: number;
  checkInCount: number;

  // Moderation
  isReported: boolean;
  reportCount?: number;
}

/**
 * Opening hours
 */
export interface OpeningHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  open: string; // HH:mm format
  close: string; // HH:mm format
  isClosed: boolean;
}

/**
 * Restaurant list item (for table/grid views)
 */
export interface RestaurantListItem {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  cuisine: CuisineType;
  rating: number;
  reviewCount: number;
  city: string;
  status: RestaurantStatus;
  verificationStatus: VerificationStatus;
  priceRange: PriceRange;
  createdAt: Date;
}

/**
 * Restaurant filters
 */
export interface RestaurantFilters {
  search?: string; // Search by name, address, city
  status?: RestaurantStatus; // Filter by status
  verificationStatus?: VerificationStatus; // Filter by verification
  cuisine?: CuisineType[]; // Filter by cuisine type(s)
  priceRange?: PriceRange[]; // Filter by price range
  city?: string; // Filter by city
  rating?: number; // Minimum rating
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
}

/**
 * Restaurant statistics
 */
export interface RestaurantStats {
  totalRestaurants: number;
  pendingRestaurants: number;
  verifiedRestaurants: number;
  activeRestaurants: number;
  suspendedRestaurants: number;
  rejectedRestaurants: number;
  averageRating: number;
  totalReviews: number;
  totalPhotos: number;
}

/**
 * Restaurant photo
 */
export interface RestaurantPhoto extends Timestamped {
  id: string;
  restaurantId: string;
  url: string;
  caption?: string;
  uploadedBy: string; // User ID
  isApproved: boolean;
  order: number;
}

/**
 * Menu category
 */
export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  order: number;
  items: MenuItem[];
}

/**
 * Menu item
 */
export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  photo?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  spiceLevel?: number; // 1-3
  available: boolean;
  order: number;
}

/**
 * Restaurant review (summary)
 */
export interface RestaurantReview {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  text: string;
  photos?: string[];
  helpfulCount: number;
  isVerifiedReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Verification action
 */
export interface VerificationAction {
  action: 'approve' | 'reject';
  notes?: string;
}

/**
 * Restaurant export data
 */
export interface RestaurantExportData {
  restaurants: RestaurantListItem[];
  exportDate: Date;
  exportedBy: string;
  filters: RestaurantFilters;
}
