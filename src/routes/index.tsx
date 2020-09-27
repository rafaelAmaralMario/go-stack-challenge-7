import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useCart } from '../hooks/cart';

import AppRoutes from './app.routes';

const Routes: React.FC = () => {
  const { cartLoading } = useCart();

  if (cartLoading) {
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <AppRoutes />;
};

export default Routes;
