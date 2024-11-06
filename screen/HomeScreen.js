import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, FlatList } from 'react-native';
import { supabase } from '../api/supabase';

const HomeScreen = ({ navigation }) => {
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    fetchLatestProducts();
  }, []);
  const fetchLatestProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('data_added', { ascending: false })
        .limit(5); // Fetch latest 5 products
      if (error) throw error;
      setLatestProducts(data);
    } catch (error) {
      console.error('Error fetching latest products:', error.message);
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
        <FlatList
          data={latestProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
        />
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
