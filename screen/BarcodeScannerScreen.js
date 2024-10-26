import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, FlatList } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { supabase } from "../api/supabase"; // Adjust the import path as needed

const BarcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);

    console.log(`Scanning data: ${data}`); // Log scanned barcode data

    try {
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("barcode", data)
        .single();

      if (error) {
        console.error("Error fetching product:", error); // Log error details
        alert(`Error fetching product: ${error.message}`);
        return;
      }

      if (product) {
        setScannedProducts((prevProducts) => [
          ...prevProducts,
          { name: product.name, price: product.price },
        ]);
        alert(`Product scanned: ${product.name}`);
      } else {
        alert("No product found for the scanned barcode.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const renderScannedProduct = ({ item }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>Price: P{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
          <Button
            title={"Tap to Scan Again"}
            onPress={() => setScanned(false)}
          />
        )}
      </View>
      <View style={styles.productListContainer}>
        <Text style={styles.title}>Scanned Products</Text>
        <FlatList
          data={scannedProducts}
          renderItem={renderScannedProduct}
          keyExtractor={(item, index) => index.toString()}
          style={styles.productList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productListContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  productList: {
    width: "100%",
  },
  productItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 16,
    color: "#4CAF50",
  },
});

export default BarcodeScannerScreen;
