import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    fetchLatestProductsFromStorage();
  }, []);

  const fetchLatestProductsFromStorage = async () => {
    try {
      const storedProducts = await AsyncStorage.getItem('products');

      if (storedProducts) {
        const productsArray = JSON.parse(storedProducts);

        // Sort by `data_added` to ensure latest items are displayed first
        const latestProducts = productsArray
          .sort((a, b) => new Date(b.data_added) - new Date(a.data_added))
          .slice(0, 5); // Get the latest 5 products

        setLatestProducts(latestProducts);
      } else {
        console.log('No products found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching products from storage:', error.message);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>P{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to Grocery Calculator App</Text>
      </View>

      {/* Latest Products */}
      <View style={styles.latestProductsContainer}>
        <Text style={styles.sectionTitle}>Latest Added Items</Text>

        {loading ? (
          <Text>Loading...</Text> // Show loading text while data is being fetched
        ) : latestProducts.length > 0 ? (
          <FlatList
            data={latestProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
          <Text>No products available</Text> // Handle no products scenario
        )}
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title='Login' onPress={() => navigation.navigate('Login')} />
        </View>
        <View style={styles.button}>
          <Button
            title='Barcode Scanner'
            onPress={() => navigation.navigate('Barcode Scanner')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  latestProductsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    color: '#2ECC71',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default HomeScreen;
