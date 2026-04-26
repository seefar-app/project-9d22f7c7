import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
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
  rateOrder: (orderId: string, rating: number, review: string) => Promise<void>;
  reorder: (orderId: string) => void;

  // Address actions
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  selectAddress: (id: string) => void;
}

const mapDatabaseRestaurantToRestaurant = (dbRestaurant: any, menu: MenuItem[] = []): Restaurant => ({
  id: dbRestaurant.id,
  name: dbRestaurant.name,
  cuisine: dbRestaurant.cuisine,
  rating: Number(dbRestaurant.rating) || 0,
  reviewCount: dbRestaurant.reviewCount || 0,
  deliveryTime: dbRestaurant.deliveryTime,
  deliveryFee: Number(dbRestaurant.deliveryFee) || 0,
  minOrder: Number(dbRestaurant.minOrder) || 0,
  image: dbRestaurant.image,
  address: dbRestaurant.address,
  phone: dbRestaurant.phone,
  operatingHours: dbRestaurant.operatingHours,
  menu,
  isFavorite: false,
  latitude: Number(dbRestaurant.latitude) || 0,
  longitude: Number(dbRestaurant.longitude) || 0,
});

const mapDatabaseMenuItemToMenuItem = (dbItem: any): MenuItem => ({
  id: dbItem.id,
  restaurantId: dbItem.restaurantId,
  name: dbItem.name,
  description: dbItem.description,
  price: Number(dbItem.price) || 0,
  image: dbItem.image,
  category: dbItem.category,
  customizations: [],
  isPopular: dbItem.isPopular || false,
});

const mapDatabaseAddressToAddress = (dbAddress: any): Address => ({
  id: dbAddress.id,
  label: dbAddress.label,
  street: dbAddress.street,
  apartment: dbAddress.apartment,
  city: dbAddress.city,
  zipcode: dbAddress.zipcode,
  latitude: Number(dbAddress.latitude) || 0,
  longitude: Number(dbAddress.longitude) || 0,
  isDefault: dbAddress.isDefault || false,
  instructions: dbAddress.instructions,
});

const mapDatabaseOrderToOrder = (dbOrder: any, items: CartItem[] = [], restaurant: Restaurant | null = null, address: Address | null = null, paymentMethod: PaymentMethod | null = null, driver: Driver | null = null): Order => ({
  id: dbOrder.id,
  restaurantId: dbOrder.restaurantId,
  restaurant: restaurant || { id: '', name: '', cuisine: '', rating: 0, reviewCount: 0, deliveryTime: '', deliveryFee: 0, minOrder: 0, image: '', address: '', phone: '', operatingHours: '', menu: [], isFavorite: false, latitude: 0, longitude: 0 },
  userId: dbOrder.userId,
  items,
  subtotal: Number(dbOrder.subtotal) || 0,
  deliveryFee: Number(dbOrder.deliveryFee) || 0,
  serviceFee: Number(dbOrder.serviceFee) || 0,
  tip: Number(dbOrder.tip) || 0,
  totalPrice: Number(dbOrder.totalPrice) || 0,
  deliveryAddress: address || { id: '', label: '', street: '', apartment: '', city: '', zipcode: '', latitude: 0, longitude: 0, isDefault: false, instructions: '' },
  paymentMethod: paymentMethod || { id: '', userId: '', type: '', last4: '', brand: '', isDefault: false },
  status: dbOrder.status as OrderStatus,
  driver: driver || null,
  estimatedDelivery: dbOrder.estimatedDelivery ? new Date(dbOrder.estimatedDelivery) : new Date(),
  createdAt: dbOrder.created_at ? new Date(dbOrder.created_at) : new Date(),
  rating: dbOrder.rating,
  review: dbOrder.review,
});

export const useStore = create<StoreState>((set, get) => ({
  restaurants: [],
  selectedRestaurant: null,
  cart: [],
  cartRestaurantId: null,
  orders: [],
  activeOrder: null,
  addresses: [],
  selectedAddress: null,
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
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*');

      if (error) throw error;

      const restaurantsWithMenus: Restaurant[] = [];

      for (const dbRestaurant of restaurants || []) {
        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurantId', dbRestaurant.id);

        if (menuError) throw menuError;

        const menu = (menuItems || []).map(mapDatabaseMenuItemToMenuItem);
        restaurantsWithMenus.push(mapDatabaseRestaurantToRestaurant(dbRestaurant, menu));
      }

      set({ restaurants: restaurantsWithMenus, isLoading: false });
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const restaurant = restaurants.find(r => r.id === cartRestaurantId);
      if (!restaurant || !selectedAddress) {
        throw new Error('Missing restaurant or address');
      }

      const totals = get().getCartTotal();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurantId: restaurant.id,
          userId: user.id,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          serviceFee: totals.serviceFee,
          tip,
          totalPrice: totals.total + tip,
          deliveryAddressId: selectedAddress.id,
          paymentMethodId: paymentMethod.id,
          status: 'pending',
          estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      for (const cartItem of cart) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            orderId: orderData.id,
            menuItemId: cartItem.menuItem.id,
            quantity: cartItem.quantity,
            specialInstructions: cartItem.specialInstructions,
            totalPrice: cartItem.totalPrice,
          });

        if (itemError) throw itemError;
      }

      const order = mapDatabaseOrderToOrder(orderData, cart, restaurant, selectedAddress, paymentMethod);

      set(state => ({
        orders: [order, ...state.orders],
        activeOrder: order,
        cart: [],
        cartRestaurantId: null,
        isLoading: false,
      }));

      return order;
    } catch (error) {
      set({ error: 'Failed to create order', isLoading: false });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const orders: Order[] = [];

      for (const dbOrder of ordersData || []) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('orderId', dbOrder.id);

        if (itemsError) throw itemsError;

        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', dbOrder.restaurantId)
          .single();

        if (restaurantError) throw restaurantError;

        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', dbOrder.deliveryAddressId)
          .single();

        if (addressError && addressError.code !== 'PGRST116') throw addressError;

        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('id', dbOrder.paymentMethodId)
          .single();

        if (paymentError && paymentError.code !== 'PGRST116') throw paymentError;

        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', dbOrder.driverId)
          .single();

        if (driverError && driverError.code !== 'PGRST116') throw driverError;

        const cartItems: CartItem[] = (itemsData || []).map(item => ({
          id: item.id,
          menuItem: {
            id: item.menuItemId,
            restaurantId: dbOrder.restaurantId,
            name: '',
            description: '',
            price: Number(item.totalPrice) / item.quantity,
            image: '',
            category: '',
            customizations: [],
            isPopular: false,
          },
          quantity: item.quantity,
          selectedCustomizations: [],
          specialInstructions: item.specialInstructions || '',
          totalPrice: Number(item.totalPrice),
        }));

        const restaurant = restaurantData ? mapDatabaseRestaurantToRestaurant(restaurantData) : null;
        const address = addressData ? mapDatabaseAddressToAddress(addressData) : null;
        const payment = paymentData ? { id: paymentData.id, userId: paymentData.userId, type: paymentData.type, last4: paymentData.last4, brand: paymentData.brand, isDefault: paymentData.isDefault } : null;
        const driver = driverData ? { id: driverData.id, name: driverData.name, phone: driverData.phone, avatar: driverData.avatar, vehicle: driverData.vehicle, licensePlate: driverData.licensePlate, rating: Number(driverData.rating), currentLatitude: Number(driverData.currentLatitude), currentLongitude: Number(driverData.currentLongitude), status: driverData.status } : null;

        orders.push(mapDatabaseOrderToOrder(dbOrder, cartItems, restaurant, address, payment, driver));
      }

      set({ orders, isLoading: false });
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

  rateOrder: async (orderId, rating, review) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ rating, review })
        .eq('id', orderId);

      if (error) throw error;

      set(state => ({
        orders: state.orders.map(o =>
          o.id === orderId ? { ...o, rating, review } : o
        ),
      }));
    } catch (error) {
      set({ error: 'Failed to rate order' });
      throw error;
    }
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

  addAddress: async (addressData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newAddress, error } = await supabase
        .from('addresses')
        .insert({
          userId: user.id,
          label: addressData.label,
          street: addressData.street,
          apartment: addressData.apartment,
          city: addressData.city,
          zipcode: addressData.zipcode,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          isDefault: addressData.isDefault || false,
          instructions: addressData.instructions,
        })
        .select()
        .single();

      if (error) throw error;

      const address = mapDatabaseAddressToAddress(newAddress);
      set(state => ({
        addresses: [...state.addresses, address],
      }));
    } catch (error) {
      set({ error: 'Failed to add address' });
      throw error;
    }
  },

  updateAddress: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        addresses: state.addresses.map(a =>
          a.id === id ? { ...a, ...updates } : a
        ),
      }));
    } catch (error) {
      set({ error: 'Failed to update address' });
      throw error;
    }
  },

  deleteAddress: async (id) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        addresses: state.addresses.filter(a => a.id !== id),
        selectedAddress: state.selectedAddress?.id === id ? null : state.selectedAddress,
      }));
    } catch (error) {
      set({ error: 'Failed to delete address' });
      throw error;
    }
  },

  setDefaultAddress: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('addresses')
        .update({ isDefault: true })
        .eq('id', id)
        .eq('userId', user.id);

      if (error) throw error;

      const { error: resetError } = await supabase
        .from('addresses')
        .update({ isDefault: false })
        .eq('userId', user.id)
        .neq('id', id);

      if (resetError) throw resetError;

      set(state => ({
        addresses: state.addresses.map(a => ({
          ...a,
          isDefault: a.id === id,
        })),
      }));
    } catch (error) {
      set({ error: 'Failed to set default address' });
      throw error;
    }
  },

  selectAddress: (id) => {
    const { addresses } = get();
    const address = addresses.find(a => a.id === id) || null;
    set({ selectedAddress: address });
  },
}));