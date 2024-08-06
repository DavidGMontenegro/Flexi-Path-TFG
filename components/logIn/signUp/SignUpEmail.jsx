import React from "react";
import { View, StyleSheet, Text, TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Component for displaying a message after signing up with email.
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onBackToLogin - Function to handle navigation back to login page.
 * @returns {JSX.Element} Sign Up Email confirmation component.
 */
export default function SignUpEmail({ onBackToLogin }) {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Check your inbox</Text>
        <View style={styles.line}></View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            We have sent a confirmation email for your response. Please, ensure
            to check your spam box in case you can't find it in your inbox.
          </Text>
        </View>
      </View>
      <TouchableHighlight
        onPress={onBackToLogin}
        underlayColor="#2E86C100"
        style={styles.buttonContainer}
      >
        <View style={styles.button}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Return to homepage</Text>
        </View>
      </TouchableHighlight>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#808080",
    borderRadius: 10,
    margin: 20,
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  line: {
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 20,
  },
  textContainer: {
    marginBottom: 20
  },
  text: {
    textAlign: "center",
    fontSize: 16,
    color: "#FFF"
  },
  buttonContainer: {
    alignItems: "center"
  },
  button: {
    backgroundColor: "#2E86C1",
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 20
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    marginLeft: 10
  },
});
