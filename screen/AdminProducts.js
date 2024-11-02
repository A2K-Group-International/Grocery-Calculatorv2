import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Button,
} from 'react-native';
import { supabase } from '../api/supabase'; // Adjust the import path as needed
import { BarCodeScanner } from 'expo-barcode-scanner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [productData, setProductData] = useState({
    id: null,
    name: '',
    barcode: '',
    price: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');

      if (error) throw error;

      setProducts(data);
    } catch (error) {
      Alert.alert('Error fetching products', error.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

              if (error) throw error;

              setProducts(products.filter((product) => product.id !== id));
            } catch (error) {
              Alert.alert('Error deleting product', error.message);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (product) => {
    setProductData({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price.toString(), // Ensure it's a string for TextInput
    });
    setModalVisible(true);
  };

  const handleAddEditProduct = async () => {
    const { name, barcode, price, id } = productData;

    // Ensure price is converted to a number if necessary
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      Alert.alert('Error', 'Price must be a valid number.');
      return;
    }

    try {
      if (id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({ name, barcode, price: priceValue }) // Use the numeric price
          .eq('id', id);

        if (error) throw error;

        Alert.alert('Success', 'Product updated successfully.');
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([{ name, barcode, price: priceValue }]); // Use the numeric price

        if (error) throw error;

        Alert.alert('Success', 'Product added successfully.');
      }

      // Reset product data and close modal
      setProductData({ id: null, name: '', barcode: '', price: '' });
      setModalVisible(false);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBarcode}>Barcode: {item.barcode}</Text>
        <Text style={styles.productPrice}>P{item.price}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const startScanning = () => {
    setScanning(true);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setProductData({ ...productData, barcode: data });
    stopScanning();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>List of Products</Text>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.productList}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      {/* Modal for Adding/Editing Products */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {productData.id ? 'Edit Product' : 'Add Product'}
          </Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={productData.name}
                onChangeText={(text) =>
                  setProductData({ ...productData, name: text })
                }
                placeholder='Enter product name'
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Barcode</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 5 }]} // 50% width with right margin
                  value={productData.barcode}
                  onChangeText={(text) =>
                    setProductData({ ...productData, barcode: text })
                  }
                  placeholder='Scan or enter barcode'
                />
                <View style={{ flex: 1 }}>
                  <Button title='Scan' onPress={startScanning} />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={productData.price}
                onChangeText={(text) =>
                  setProductData({ ...productData, price: text })
                }
                keyboardType='numeric'
                placeholder='Enter price'
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button title='Save' onPress={handleAddEditProduct} />
            <Button title='Cancel' onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal
        animationType='slide'
        transparent={false}
        visible={scanning}
        onRequestClose={stopScanning}
      >
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <Button title='Cancel' onPress={stopScanning} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  productList: {
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  productBarcode: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  productPrice: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 2,
    padding: 10,
    fontSize: 16,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default AdminProducts;
