import React, { useState, useEffect } from "react";
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
} from "react-native";
import { supabase } from "../api/supabase"; // Adjust the import path as needed

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productData, setProductData] = useState({
    id: null,
    name: "",
    barcode: "",
    price: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");

      if (error) throw error;

      setProducts(data);
    } catch (error) {
      Alert.alert("Error fetching products", error.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

              if (error) throw error;

              setProducts(products.filter((product) => product.id !== id));
            } catch (error) {
              Alert.alert("Error deleting product", error.message);
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
      Alert.alert("Error", "Price must be a valid number.");
      return;
    }

    try {
      if (id) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({ name, barcode, price: priceValue }) // Use the numeric price
          .eq("id", id);

        if (error) throw error;

        Alert.alert("Success", "Product updated successfully.");
      } else {
        // Add new product
        const { error } = await supabase
          .from("products")
          .insert([{ name, barcode, price: priceValue }]); // Use the numeric price

        if (error) throw error;

        Alert.alert("Success", "Product added successfully.");
      }

      // Reset product data and close modal
      setProductData({ id: null, name: "", barcode: "", price: "" });
      setModalVisible(false);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      Alert.alert("Error", error.message);
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {productData.id ? "Edit Product" : "Add Product"}
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
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Barcode</Text>
              <TextInput
                style={styles.input}
                value={productData.barcode}
                onChangeText={(text) =>
                  setProductData({ ...productData, barcode: text })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={productData.price}
                onChangeText={(text) =>
                  setProductData({ ...productData, price: text })
                }
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={handleAddEditProduct} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  productList: {
    marginBottom: 20,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
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
    color: "#333",
    fontWeight: "600",
  },
  productBarcode: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  productPrice: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF3D00",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    color: "#FFF",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#F9F9F9",
  },
});

export default AdminProducts;
