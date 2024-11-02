import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { supabase } from '../api/supabase';

const BarcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', data)
        .single();

      if (error) {
        alert(`Error fetching product: ${error.message}`);
        return;
      }

      if (product) {
        setProductDetails(product);
        setModalVisible(true);
      } else {
        alert('No product found for the scanned barcode.');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const confirmProduct = () => {
    setScannedProducts((prevProducts) => {
      const existingProduct = prevProducts.find(
        (p) => p.name === productDetails.name
      );
      if (existingProduct) {
        return prevProducts.map((p) =>
          p.name === productDetails.name
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      } else {
        return [
          ...prevProducts,
          {
            name: productDetails.name,
            price: productDetails.price,
            quantity: 1,
          },
        ];
      }
    });
    setModalVisible(false);
    setProductDetails(null);
  };

  const cancelProduct = () => {
    setModalVisible(false);
    setProductDetails(null);
  };

  const incrementQuantity = (index) => {
    setScannedProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index ? { ...product, quantity: product.quantity + 1 } : product
      )
    );
  };

  const decrementQuantity = (index) => {
    setScannedProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  const removeProduct = (index) => {
    setScannedProducts((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
  };

  const renderScannedProduct = ({ item, index }) => (
    <TouchableOpacity
      onLongPress={() =>
        Alert.alert(
          'Remove Item',
          `Are you sure you want to remove ${item.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', onPress: () => removeProduct(index) },
          ]
        )
      }
      style={styles.productItem}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => decrementQuantity(index)}>
          <Text style={styles.button}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => incrementQuantity(index)}>
          <Text style={styles.button}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productPriceContainer}>
        <Text style={styles.productPrice}>Price: P{item.price}</Text>
        <Text style={styles.totalPrice}>
          Total: P{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const calculateMasterTotal = () => {
    return scannedProducts
      .reduce((total, product) => total + product.price * product.quantity, 0)
      .toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={[StyleSheet.absoluteFillObject, styles.camera]}
        />
        {scanned && (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanButtonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.productListContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Name</Text>
          <Text style={styles.headerText}>Quantity</Text>
          <Text style={styles.headerText}>Price</Text>
        </View>
        <FlatList
          data={scannedProducts}
          renderItem={renderScannedProduct}
          keyExtractor={(item, index) => index.toString()}
          style={styles.productList}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.masterTotalText}>
          Master Total: P{calculateMasterTotal()}
        </Text>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={cancelProduct}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Product Details</Text>
            {productDetails && (
              <>
                <Text style={styles.modalText}>
                  Name: {productDetails.name}
                </Text>
                <Text style={styles.modalText}>
                  Price: P{productDetails.price}
                </Text>
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={confirmProduct}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelProduct}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  scanButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  scannerContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productListContainer: { flex: 2, backgroundColor: '#f9f9f9', padding: 10 },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    justifyContent: 'space-between',
  },
  productInfo: { flex: 2 },
  productName: { fontSize: 16, fontWeight: '600' },
  productPriceContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  productPrice: { fontSize: 14, color: '#4CAF50' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  button: { fontSize: 20, paddingHorizontal: 10, color: '#007BFF' },
  quantity: { fontSize: 18, marginHorizontal: 10 },
  totalPrice: { fontSize: 16, fontWeight: 'bold' },
  footer: {
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  masterTotalText: { fontSize: 20, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalText: { fontSize: 16, marginVertical: 5 },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#007BFF',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  modalButtonText: { color: 'white', fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BarcodeScannerScreen;
