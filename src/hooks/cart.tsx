import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  cartLoading: boolean;
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartProducts = await AsyncStorage.getItem('@GoMarket:products');
      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }

      setCartLoading(false);
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newCartProducts = [...products];
      const productIndex = newCartProducts.findIndex(
        cartProduct => cartProduct.id === id,
      );
      newCartProducts[productIndex].quantity += 1;
      setProducts(newCartProducts);

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const hasProdutOnCart = products.some(
        cartProduct => cartProduct.id === product.id,
      );

      if (hasProdutOnCart) {
        increment(product.id);
      } else {
        product.quantity = 1;
        const newCartProduct = [...products, product];
        setProducts(newCartProduct);
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(newCartProduct),
        );
      }
    },
    [increment, products],
  );

  const decrement = useCallback(
    async id => {
      let newCartProducts = [...products];
      const productIndex = newCartProducts.findIndex(
        cartProduct => cartProduct.id === id,
      );
      newCartProducts[productIndex].quantity -= 1;
      if (newCartProducts[productIndex].quantity <= 0) {
        newCartProducts = newCartProducts.filter(
          newCartProduct => newCartProduct.id !== id,
        );
      }
      setProducts(newCartProducts);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products, cartLoading }),
    [products, addToCart, increment, decrement, cartLoading],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
