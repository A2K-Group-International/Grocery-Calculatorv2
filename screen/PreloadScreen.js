import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabase';

const PreloadScreen = ({ navigation }) => {
  useEffect(() => {
    checkAndPreloadProducts();
  }, []);

  const checkAndPreloadProducts = async () => {
    try {
      // Step 1: Fetch all data from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('data_added', { ascending: false });

      if (error) throw error;

      console.log('Fetched data from Supabase:', data);

      // Step 2: Get stored products from AsyncStorage
      const storedProducts = await AsyncStorage.getItem('products');
      const storedProductsParsed = storedProducts
        ? JSON.parse(storedProducts)
        : [];

      // Step 3: Compare fetched data with stored data (based on product IDs)
      const newProducts = data.filter(
        (product) =>
          !storedProductsParsed.some((stored) => stored.id === product.id)
      );

      if (newProducts.length > 0) {
        console.log('New products found:', newProducts);

        // Save the fetched data to AsyncStorage
        await AsyncStorage.setItem('products', JSON.stringify(data));
        console.log('Products data saved to AsyncStorage:', data);

        // Notify the user about the new items and navigate to Barcode Scanner
        Alert.alert(
          'New Items Available!',
          'New products have been added to the database.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Barcode Scanner'),
            },
          ],
          { cancelable: false }
        );
      } else {
        console.log('No new updates found');
        navigation.replace('Barcode Scanner'); // No new products, navigate directly
      }
    } catch (error) {
      console.error('Error preloading products:', error.message);
      navigation.replace('Barcode Scanner'); // Handle error and navigate
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Loading products...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default PreloadScreen;
