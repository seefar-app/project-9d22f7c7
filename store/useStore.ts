import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import {
  Restaurant,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  Address,
  Driver,
  SearchFilters,
  PaymentMethod,
} from '@/types';

interface StoreState {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  cart: CartItem[];
  cartRestaurantId: string | null;
  orders: Order[];
  activeOrder: Order | null;
  addresses: Address[];
  selectedAddress: Address | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  error: string | null;

  // Restaurant actions
  fetchRestaurants: () => Promise<void>;
  selectRestaurant: (id: string) => void;
  toggleFavorite: (id: string) => void;
  searchRestaurants: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;

  // Cart actions
  addToCart: (menuItem: MenuItem, quantity: number, customizations?: any[], instructions?: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; deliveryFee: number; serviceFee: number; total: number };

  // Order actions
  createOrder: (paymentMethod: PaymentMethod, tip: number) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  rateOrder: (orderId: string, rating: number, review: string) => void;
  reorder: (orderId: string) => void;

  // Address actions
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  selectAddress: (id: string) => void;
}

// Mock data
const mockDriver: Driver = {
  id: Crypto.randomUUID(),
  name: 'Marcus Chen',
  phone: '+1 555-987-6543',
  avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  vehicle: 'Honda Civic',
  licensePlate: 'ABC 1234',
  rating: 4.9,
  currentLatitude: 40.7589,
  currentLongitude: -73.9851,
  status: 'busy',
};

const mockMenuItems: MenuItem[] = [
  {
    id: Crypto.randomUUID(),
    restaurantId: '',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella, basil, and olive oil on crispy thin crust',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    category: 'Pizza',
    customizations: [
      {
        id: '1',
        name: 'Size',
        options: [
          { id: 's', name: 'Small (10")', price: 0 },
          { id: 'm', name: 'Medium (12")', price: 3 },
          { id: 'l', name: 'Large (14")', price: 5 },
        ],
        required: true,
        maxSelections: 1,
      },
      {
        id: '2',
        name: 'Extra Toppings',
        options: [
          { id: 'pepperoni', name: 'Pepperoni', price: 2 },
          { id: 'mushrooms', name: 'Mushrooms', price: 1.5 },
          { id: 'olives', name: 'Olives', price: 1.5 },
        ],
        required: false,
        maxSelections: 5,
      },
    ],
    isPopular: true,
  },
  {
    id: Crypto.randomUUID(),
    restaurantId: '',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons with house-made caesar dressing',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    category: 'Salads',
    customizations: [
      {
        id: '1',
        name: 'Add Protein',
        options: [
          { id: 'chicken', name: 'Grilled Chicken', price: 4 },
          { id: 'shrimp', name: 'Shrimp', price: 6 },
          { id: 'salmon', name: 'Salmon', price: 7 },
        ],
        required: false,
        maxSelections: 1,
      },
    ],
    isPopular: true,
  },
  {
    id: Crypto.randomUUID(),
    restaurantId: '',
    name: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta with pancetta, eggs, pecorino, and black pepper',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    category: 'Pasta',
    customizations: [],
    isPopular: false,
  },
  {
    id: Crypto.randomUUID(),
    restaurantId: '',
    name: 'Tiramisu',
    description: 'Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    category: 'Desserts',
    customizations: [],
    isPopular: true,
  },
  {
    id: Crypto.randomUUID(),
    restaurantId: '',
    name: 'Bruschetta',
    description: 'Toasted bread topped with fresh tomatoes, garlic, basil, and balsamic glaze',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400',
    category: 'Appetizers',
    customizations: [],
    isPopular: false,
  },
];

const createMockRestaurants = (): Restaurant[] => {
  const restaurants: Restaurant[] = [
    {
      id: Crypto.randomUUID(),
      name: "Bella Italia",
      cuisine: "Italian",
      rating: 4.8,
      reviewCount: 324,
      deliveryTime: "25-35 min",
      deliveryFee: 2.99,
      minOrder: 15,
      image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800",
      address: "123 Main Street, New York",
      phone: "+1 555-123-4567",
      operatingHours: "11:00 AM - 10:00 PM",
      menu: mockMenuItems.map(item => ({ ...item, restaurantId: '' })),
      isFavorite: false,
      latitude: 40.7580,
      longitude: -73.9855,
    },
    {
      id: Crypto.randomUUID(),
      name: "Sakura Sushi",
      cuisine: "Japanese",
      rating: 4.9,
      reviewCount: 512,
      deliveryTime: "30-40 min",
      deliveryFee: 3.99,
      minOrder: 20,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
      address: "456 Oak Avenue, New York",
      phone: "+1 555-234-5678",
      operatingHours: "12:00 PM - 11:00 PM",
      menu: [
        {
          id: Crypto.randomUUID(),
          restaurantId: '',
          name: 'Dragon Roll',
          description: 'Shrimp tempura, cucumber, topped with avocado and eel sauce',
          price: 15.99,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
          category: 'Rolls',
          customizations: [],
          isPopular: true,
        },
        {
          id: Crypto.randomUUID(),
          restaurantId: '',
          name: 'Salmon Sashimi',
          description: 'Fresh Atlantic salmon, 8 pieces',
          price: 18.99,
          image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
          category: 'Sashimi',
          customizations: [],
          isPopular: true,
        },
      ],
      isFavorite: true,
      latitude: 40.7614,
      longitude: -73.9776,
    },
    {
      id: Crypto.randomUUID(),
      name: "Burger Barn",
      cuisine: "American",
      rating: 4.6,
      reviewCount: 289,
      deliveryTime: "20-30 min",
      deliveryFee: 1.99,
      minOrder: 12,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
      address: "789 Elm Street, New York",
      phone: "+1 555-345-6789",
      operatingHours: "10:00 AM - 12:00 AM",
      menu: [
        {
          id: Crypto.randomUUID(),
          restaurantId: '',
          name: 'Classic Cheeseburger',
          description: 'Angus beef, american cheese, lettuce, tomato, special sauce',
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          category: 'Burgers',
          customizations: [],
          isPopular: true,
        },
      ],
      isFavorite: false,
      latitude: 40.7549,
      longitude: -73.9840,
    },
    {
      id: Crypto.randomUUID(),
      name: "Taj Mahal",
      cuisine: "Indian",
      rating: 4.7,
      reviewCount: 198,
      deliveryTime: "35-45 min",
      deliveryFee: 2.49,
      minOrder: 18,
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
      address: "321 Curry Lane, New York",
      phone: "+1 555-456-7890",
      operatingHours: "11:30 AM - 10:30 PM",
      menu: [
        {
          id: Crypto.randomUUID(),
          restaurantId: '',
          name: 'Butter Chicken',
          description: 'Tender chicken in rich tomato-cream sauce with aromatic spices',
          price: 16.99,
          image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
          category: 'Curry',
          customizations: [],
          isPopular: true,
        },
      ],
      isFavorite: false,
      latitude: 40.7520,
      longitude: -73.9890,
    },
    {
      id: Crypto.randomUUID(),
      name: "Taco Loco",
      cuisine: "Mexican",
      rating: 4.5,
      reviewCount: 256,
      deliveryTime: "20-25 min",
      deliveryFee: 1.49,
      minOrder: 10,
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
      address: "555 Salsa Street, New York",
      phone: "+1 555-567-8901",
      operatingHours: "10:00 AM - 11:00 PM",
      menu: [
        {
          id: Crypto.randomUUID(),
          restaurantId: '',
          name: 'Street Tacos',
          description: 'Three corn tortillas with carne asada, onions, cilantro',
          price: 11.99,
          image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
          category: 'Tacos',
          customizations: [],
          isPopular: true,
        },
      ],
      isFavorite: true,
      latitude: 40.7600,
      longitude: -73.9920,
    },
    {
      id: Crypto.randomUUID(),
      name: "Golden Dragon",
      cuisine: "Chinese",
      rating: 4.4,
      reviewCount: 445,
      deliveryTime: "25-35 min",
      deliveryFee: 2.99,
      minOrder: 15,
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
      address: "888 Lucky Road, New York",
      phone: "+1 555-678-9012",
      operatingHours: "11:00 AM - 11:00 PM",
      menu: [
        {
          id: Crypto.randomUUID(),
          restaurantId: '',
          name: 'Kung Pao Chicken',
          description: 'Spicy stir-fried chicken with peanuts and vegetables',
          price: 14.99,
          image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
          category: 'Main',
          customizations: [],
          isPopular: true,
        },
      ],
      isFavorite: false,
      latitude: 40.7565,
      longitude: -73.9800,
    },
  ];

  return restaurants.map(r => ({
    ...r,
    menu: r.menu.map(item => ({ ...item, restaurantId: r.id })),
  }));
};

const mockAddresses: Address[] = [
  {
    id: Crypto.randomUUID(),
    label: 'Home',
    street: '123 Frost Avenue',
    apartment: 'Apt 4B',
    city: 'New York',
    zipcode: '10001',
    latitude: 40.7505,
    longitude: -73.9934,
    isDefault: true,
    instructions: 'Ring doorbell twice',
  },
  {
    id: Crypto.randomUUID(),
    label: 'Work',
    street: '456 Corporate Plaza',
    apartment: 'Floor 12',
    city: 'New York',
    zipcode: '10016',
    latitude: 40.7484,
    longitude: -73.9857,
    isDefault: false,
    instructions: 'Leave at front desk',
  },
];

export const useStore = create<StoreState>((set, get) => ({
  restaurants: [],
  selectedRestaurant: null,
  cart: [],
  cartRestaurantId: null,
  orders: [],
  activeOrder: null,
  addresses: mockAddresses,
  selectedAddress: mockAddresses.find(a => a.isDefault) || null,
  searchFilters: {
    query: '',
    cuisine: null,
    minRating: 0,
    maxDeliveryTime: null,
    priceRange: null,
    sortBy: 'recommended',
  },
  isLoading: false,
  error: null,

  fetchRestaurants: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const restaurants = createMockRestaurants();
      set({ restaurants, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch restaurants', isLoading: false });
    }
  },

  selectRestaurant: (id: string) => {
    const { restaurants } = get();
    const restaurant = restaurants.find(r => r.id === id) || null;
    set({ selectedRestaurant: restaurant });
  },

  toggleFavorite: (id: string) => {
    const { restaurants } = get();
    set({
      restaurants: restaurants.map(r =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      ),
    });
  },

  searchRestaurants: (query: string) => {
    set(state => ({
      searchFilters: { ...state.searchFilters, query },
    }));
  },

  setFilters: (filters: Partial<SearchFilters>) => {
    set(state => ({
      searchFilters: { ...state.searchFilters, ...filters },
    }));
  },

  addToCart: (menuItem, quantity, customizations = [], instructions = '') => {
    const { cart, cartRestaurantId } = get();
    
    if (cartRestaurantId && cartRestaurantId !== menuItem.restaurantId) {
      set({ cart: [], cartRestaurantId: menuItem.restaurantId });
    }

    const itemPrice = menuItem.price * quantity;
    const cartItem: CartItem = {
      id: Crypto.randomUUID(),
      menuItem,
      quantity,
      selectedCustomizations: customizations,
      specialInstructions: instructions,
      totalPrice: itemPrice,
    };

    set(state => ({
      cart: [...state.cart, cartItem],
      cartRestaurantId: menuItem.restaurantId,
    }));
  },

  updateCartItemQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }

    set(state => ({
      cart: state.cart.map(item =>
        item.id === cartItemId
          ? {
              ...item,
              quantity,
              totalPrice: item.menuItem.price * quantity,
            }
          : item
      ),
    }));
  },

  removeFromCart: (cartItemId) => {
    set(state => {
      const newCart = state.cart.filter(item => item.id !== cartItemId);
      return {
        cart: newCart,
        cartRestaurantId: newCart.length > 0 ? state.cartRestaurantId : null,
      };
    });
  },

  clearCart: () => {
    set({ cart: [], cartRestaurantId: null });
  },

  getCartTotal: () => {
    const { cart, restaurants, cartRestaurantId } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const restaurant = restaurants.find(r => r.id === cartRestaurantId);
    const deliveryFee = restaurant?.deliveryFee || 2.99;
    const serviceFee = subtotal * 0.05;
    const total = subtotal + deliveryFee + serviceFee;
    return { subtotal, deliveryFee, serviceFee, total };
  },

  createOrder: async (paymentMethod, tip) => {
    const { cart, cartRestaurantId, restaurants, selectedAddress } = get();
    set({ isLoading: true, error: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const restaurant = restaurants.find(r => r.id === cartRestaurantId);
      if (!restaurant || !selectedAddress) {
        throw new Error('Missing restaurant or address');
      }

      const totals = get().getCartTotal();

      const order: Order = {
        id: Crypto.randomUUID(),
        restaurantId: restaurant.id,
        restaurant,
        userId: 'current-user',
        items: [...cart],
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        serviceFee: totals.serviceFee,
        tip,
        totalPrice: totals.total + tip,
        deliveryAddress: selectedAddress,
        paymentMethod,
        status: 'pending',
        driver: null,
        estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000),
        createdAt: new Date(),
        rating: null,
        review: null,
      };

      set(state => ({
        orders: [order, ...state.orders],
        activeOrder: order,
        cart: [],
        cartRestaurantId: null,
        isLoading: false,
      }));

      // Simulate order progression
      setTimeout(() => get().updateOrderStatus(order.id, 'confirmed'), 5000);
      setTimeout(() => get().updateOrderStatus(order.id, 'preparing'), 15000);
      setTimeout(() => {
        set(state => ({
          orders: state.orders.map(o =>
            o.id === order.id ? { ...o, driver: mockDriver } : o
          ),
          activeOrder: state.activeOrder?.id === order.id
            ? { ...state.activeOrder, driver: mockDriver }
            : state.activeOrder,
        }));
        get().updateOrderStatus(order.id, 'picked_up');
      }, 25000);
      setTimeout(() => get().updateOrderStatus(order.id, 'in_transit'), 30000);

      return order;
    } catch (error) {
      set({ error: 'Failed to create order', isLoading: false });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch orders', isLoading: false });
    }
  },

  getOrderById: (id) => {
    return get().orders.find(o => o.id === id);
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, status } : o
      ),
      activeOrder: state.activeOrder?.id === orderId
        ? { ...state.activeOrder, status }
        : state.activeOrder,
    }));
  },

  rateOrder: (orderId, rating, review) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, rating, review } : o
      ),
    }));
  },

  reorder: (orderId) => {
    const { orders, restaurants } = get();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const restaurant = restaurants.find(r => r.id === order.restaurantId);
    if (!restaurant) return;

    set({
      cart: order.items.map(item => ({
        ...item,
        id: Crypto.randomUUID(),
      })),
      cartRestaurantId: order.restaurantId,
      selectedRestaurant: restaurant,
    });
  },

  addAddress: (addressData) => {
    const address: Address = {
      ...addressData,
      id: Crypto.randomUUID(),
    };
    set(state => ({
      addresses: [...state.addresses, address],
    }));
  },

  updateAddress: (id, updates) => {
    set(state => ({
      addresses: state.addresses.map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  },

  deleteAddress: (id) => {
    set(state => ({
      addresses: state.addresses.filter(a => a.id !== id),
      selectedAddress: state.selectedAddress?.id === id ? null : state.selectedAddress,
    }));
  },

  setDefaultAddress: (id) => {
    set(state => ({
      addresses: state.addresses.map(a => ({
        ...a,
        isDefault: a.id === id,
      })),
    }));
  },

  selectAddress: (id) => {
    const { addresses } = get();
    const address = addresses.find(a => a.id === id) || null;
    set({ selectedAddress: address });
  },
}));