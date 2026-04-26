export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  defaultAddressId: string | null;
  savedPaymentMethods: PaymentMethod[];
  referralCode: string;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  address: string;
  phone: string;
  operatingHours: string;
  menu: MenuItem[];
  isFavorite: boolean;
  latitude: number;
  longitude: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  customizations: Customization[];
  isPopular: boolean;
}

export interface Customization {
  id: string;
  name: string;
  options: CustomizationOption[];
  required: boolean;
  maxSelections: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  specialInstructions: string;
  totalPrice: number;
}

export interface SelectedCustomization {
  customizationId: string;
  optionIds: string[];
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  totalPrice: number;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  driver: Driver | null;
  estimatedDelivery: Date;
  createdAt: Date;
  rating: number | null;
  review: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicle: string;
  licensePlate: string;
  rating: number;
  currentLatitude: number;
  currentLongitude: number;
  status: 'available' | 'busy' | 'offline';
}

export interface Address {
  id: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  instructions?: string;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  restaurantId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface SearchFilters {
  query: string;
  cuisine: string | null;
  minRating: number;
  maxDeliveryTime: number | null;
  priceRange: 'low' | 'medium' | 'high' | null;
  sortBy: 'recommended' | 'rating' | 'delivery_time' | 'distance';
}