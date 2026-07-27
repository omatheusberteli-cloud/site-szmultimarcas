import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from '../types';

export interface CartItem {
  id: string; // product id + size + color
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
  sku?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  totalItems: number;
  coupon: string;
  couponDiscountPercent: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("sz_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<string>(() => {
    return localStorage.getItem("sz_coupon") || "";
  });
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(() => {
    return localStorage.getItem("sz_coupon_discount") ? Number(localStorage.getItem("sz_coupon_discount")) : 0;
  });

  useEffect(() => {
    localStorage.setItem("sz_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem("sz_coupon", coupon);
      localStorage.setItem("sz_coupon_discount", couponDiscountPercent.toString());
    } else {
      localStorage.removeItem("sz_coupon");
      localStorage.removeItem("sz_coupon_discount");
    }
  }, [coupon, couponDiscountPercent]);

  const addToCart = (product: Product, size?: string, color?: string, quantity = 1) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'M';
    const selectedColor = color || (product.colors && product.colors[0]) || 'Preto';
    const itemId = `${product.id}-${selectedSize}-${selectedColor}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === itemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevCart,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.images?.[0] || product.imageUrl,
          category: product.category,
          size: selectedSize,
          color: selectedColor,
          quantity,
          stock: product.stock || 10,
          sku: product.sku
        }
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code: string): boolean => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'SZ10' || normalized === 'LB10' || normalized === 'LUXO10') {
      setCoupon(normalized);
      setCouponDiscountPercent(10);
      return true;
    }
    if (normalized === 'PIXVIP' || normalized === 'SZ15') {
      setCoupon(normalized);
      setCouponDiscountPercent(15);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCoupon('');
    setCouponDiscountPercent(0);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        totalItems,
        coupon,
        couponDiscountPercent,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
