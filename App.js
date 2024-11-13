import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screen/HomeScreen';
import PreloadScreen from './screen/PreloadScreen';
import LoginScreen from './screen/LoginScreen';
import AdminProducts from './screen/AdminProducts';
import BarcodeScannerScreen from './screen/BarcodeScannerScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Preload'>
        <Stack.Screen name='Preload' component={PreloadScreen} />
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='AdminProducts' component={AdminProducts} />
        <Stack.Screen name='Barcode Scanner' component={BarcodeScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
