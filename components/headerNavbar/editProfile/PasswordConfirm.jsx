import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Component for confirming password change and displaying confirmation messages.
 * @param {object} props - Component props.
 * @param {Function} props.onBackPress - Function to handle back navigation or cancellation.
 * @param {Function} props.onSavePress - Function to handle saving changes or confirmation.
 * @returns {JSX.Element} PasswordConfirm component.
 */
const PasswordConfirm = ({ onBackPress, onSavePress }) => {
  const [confirmed, setConfirmed] = useState(false);
  const navigation = useNavigation();

  /**
   * Handles confirming the change of password.
   * Calls the onSavePress function and sets confirmation state to true.
   */
  const handleConfirmChange = () => {
    onSavePress();
    setConfirmed(true);
  };

  return (
    <View style={styles.container}>
      {!confirmed ? (
        <View>
          <Text style={styles.question}>
            ¿Are you sure you want to change your personal information?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableHighlight
              onPress={onBackPress}
              style={styles.cancelButton}
              underlayColor="#252525"
              activeOpacity={0.5}
            >
              <Text style={{ color: "white", fontSize: 16 }}>No, cancel</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={handleConfirmChange}
              style={styles.saveButton}
              underlayColor="#252525"
              activeOpacity={0.5}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Yes, change</Text>
            </TouchableHighlight>
          </View>
        </View>
      ) : (
        <View style={styles.confirmationContainer}>
          <Text style={{ color: "white", fontSize: 28, marginVertical: 20 }}>
            Password Changed
          </Text>
          <Text style={styles.confirmationText}>
            Your password has been changed successfully!
          </Text>
          <TouchableHighlight
            onPress={onBackPress}
            style={styles.exitButton}
            underlayColor="#252525"
            activeOpacity={0.5}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Ionicons name="chevron-back-outline" size={14} color="#FFF" />
              <Text style={{ color: "white", fontSize: 16 }}>Go back</Text>
            </View>
          </TouchableHighlight>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#808080",
    borderRadius: 15,
    marginTop: 10,
    paddingVertical: 15,
  },
  question: {
    marginVertical: 20,
    marginHorizontal: 40,
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#FFA500",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  confirmationContainer: {
    alignItems: "center",
  },
  confirmationText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "300"
  },
  exitButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
    width: 125
  },
});

export default PasswordConfirm;
