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
import AsyncStorage from '@react-native-async-storage/async-storage';

const BarcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [products, setProducts] = useState([]); // To store the products loaded from AsyncStorage

  useEffect(() => {
    // Request permission to access the camera
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Load products from AsyncStorage when the component mounts
    const loadProducts = async () => {
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
        console.log('Products: ', products);
      }
    };
    loadProducts();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    // Search for the scanned barcode in the products loaded from AsyncStorage
    const product = products.find((p) => p.barcode === data);

    if (!product) {
      alert('Scanned barcode item not found.');
      return;
    }

    setProductDetails(product);
    setModalVisible(true);
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 5 },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: { color: 'white', fontWeight: 'bold' },
  header: { flexDirection: 'row', padding: 10, backgroundColor: '#f1f1f1' },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BarcodeScannerScreen;
