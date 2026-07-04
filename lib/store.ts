import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface CartItem {
  id: string; // Product ID or unique cart item ID
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  image: string;
  quantity: number;
  cpu: string;
  ram: string;
  ssd: string;
  gpu: string;
}

export interface Coupon {
  code: string;
  discountType: string; // percentage, fixed_amount
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  shippingMethod: ShippingMethod | null;
  
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  setShippingMethod: (method: ShippingMethod) => void;
  clearCart: () => void;
  
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartShipping: () => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      shippingMethod: null,

      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product.id);

        if (existingItem) {
          const updatedItems = items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ items: updatedItems });
        } else {
          const newItem: CartItem = {
            id: product.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            discountPrice: product.discountPrice,
            image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400",
            quantity,
            cpu: product.cpu,
            ram: product.ram,
            ssd: product.ssd,
            gpu: product.gpu,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeFromCart: (productId) => {
        const items = get().items.filter((item) => item.productId !== productId);
        set({ items });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        const items = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        set({ items });
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      setShippingMethod: (method) => {
        set({ shippingMethod: method });
      },

      clearCart: () => {
        set({ items: [], coupon: null, shippingMethod: null });
      },

      getCartSubtotal: () => {
        return get().items.reduce((acc, item) => {
          const price = item.discountPrice !== null ? item.discountPrice : item.price;
          return acc + price * item.quantity;
        }, 0);
      },

      getCartDiscount: () => {
        const subtotal = get().getCartSubtotal();
        const coupon = get().coupon;
        if (!coupon) return 0;
        if (subtotal < coupon.minOrderValue) return 0;

        if (coupon.discountType === "percentage") {
          const discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
            return coupon.maxDiscount;
          }
          return discount;
        } else {
          return coupon.discountValue;
        }
      },

      getCartShipping: () => {
        return get().shippingMethod?.price || 0;
      },

      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const discount = get().getCartDiscount();
        const shipping = get().getCartShipping();
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: "laptop-cart-storage",
    }
  )
);

// Wishlist Store
interface WishlistState {
  items: any[];
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);

        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "laptop-wishlist-storage",
    }
  )
);

// Filter Store
interface FilterState {
  search: string;
  brands: string[];
  categories: string[];
  cpu: string[];
  ram: string[];
  ssd: string[];
  gpu: string[];
  os: string[];
  minPrice: number;
  maxPrice: number;
  sort: string;
  page: number;
  limit: number;

  setSearch: (search: string) => void;
  toggleBrand: (brand: string) => void;
  toggleCategory: (category: string) => void;
  toggleCpu: (cpu: string) => void;
  toggleRam: (ram: string) => void;
  toggleSsd: (ssd: string) => void;
  toggleGpu: (gpu: string) => void;
  toggleOs: (os: string) => void;
  setPriceRange: (min: number, max: number) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  brands: [],
  categories: [],
  cpu: [],
  ram: [],
  ssd: [],
  gpu: [],
  os: [],
  minPrice: 0,
  maxPrice: 100000000,
  sort: "newest",
  page: 1,
  limit: 12,

  setSearch: (search) => set({ search, page: 1 }),
  toggleBrand: (brand) =>
    set((state) => ({
      brands: state.brands.includes(brand)
        ? state.brands.filter((b) => b !== brand)
        : [...state.brands, brand],
      page: 1,
    })),
  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
      page: 1,
    })),
  toggleCpu: (cpuVal) =>
    set((state) => ({
      cpu: state.cpu.includes(cpuVal)
        ? state.cpu.filter((c) => c !== cpuVal)
        : [...state.cpu, cpuVal],
      page: 1,
    })),
  toggleRam: (ramVal) =>
    set((state) => ({
      ram: state.ram.includes(ramVal)
        ? state.ram.filter((r) => r !== ramVal)
        : [...state.ram, ramVal],
      page: 1,
    })),
  toggleSsd: (ssdVal) =>
    set((state) => ({
      ssd: state.ssd.includes(ssdVal)
        ? state.ssd.filter((s) => s !== ssdVal)
        : [...state.ssd, ssdVal],
      page: 1,
    })),
  toggleGpu: (gpuVal) =>
    set((state) => ({
      gpu: state.gpu.includes(gpuVal)
        ? state.gpu.filter((g) => g !== gpuVal)
        : [...state.gpu, gpuVal],
      page: 1,
    })),
  toggleOs: (osVal) =>
    set((state) => ({
      os: state.os.includes(osVal)
        ? state.os.filter((o) => o !== osVal)
        : [...state.os, osVal],
      page: 1,
    })),
  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({
      search: "",
      brands: [],
      categories: [],
      cpu: [],
      ram: [],
      ssd: [],
      gpu: [],
      os: [],
      minPrice: 0,
      maxPrice: 100000000,
      sort: "newest",
      page: 1,
    }),
}));
