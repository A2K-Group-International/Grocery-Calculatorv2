import React from "react";
import { View, Button, StyleSheet, Text } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to Grocery Calculator App</Text>
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Login" onPress={() => navigation.navigate("Login")} />
        </View>
        <View style={styles.button}>
          <Button
            title="Barcode Scanner"
            onPress={() => navigation.navigate("Barcode Scanner")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Align items from the top
    padding: 16, // Padding for the container
  },
  header: {
    marginBottom: 20, // Space below the header
    alignItems: "center", // Center the header text
  },
  headerText: {
    fontSize: 24, // Font size for the header
    fontWeight: "bold", // Bold font
    textAlign: "center", // Center the text
  },
  buttonContainer: {
    flex: 1, // Allow button container to take remaining space
    justifyContent: "center", // Center vertically
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default HomeScreen;
