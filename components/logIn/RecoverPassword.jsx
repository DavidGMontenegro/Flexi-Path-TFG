import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableHighlight,
} from "react-native";
import SignUpEmail from "./signUp/SignUpEmail"; // Component SignUpEmail to show after recovery
import { useNavigation } from "@react-navigation/native"; // Navigation hook
import { Formik, useField } from "formik"; // Formik for form handling, useField for form fields
import StyledTextInput from "./StyledTextInput"; // StyledTextInput component for custom input fields
import { Ionicons } from "@expo/vector-icons"; // Ionicons icons for back button
import { FIREBASE_AUTH } from "../../firebase-config"; // Firebase Auth configuration
import { sendPasswordResetEmail } from "firebase/auth"; // Function to send password reset email from Firebase Auth

/**
 * @component
 * Functional component for the password recovery screen.
 * Allows users to send an email to reset their password.
 * @returns {JSX.Element} React component for the password recovery screen.
 */
export default function RecoverPassword() {
  const navigation = useNavigation(); // Navigation hook for navigating between screens
  const [showVerification, setShowVerification] = useState(false); // State to show verification after sending email

  /**
   * Function to handle submission of the password reset form.
   * @param {Object} values - Form values (in this case, only email).
   * @returns {Promise<void>} Promise representing the action of sending the reset email.
   */
  const handleSubmit = async (values) => {
    try {
      // Send password reset email using Firebase Auth
      await sendPasswordResetEmail(FIREBASE_AUTH, values.email);
      setShowVerification(true); // Set showVerification to true to display verification
    } catch (error) {
      alert("Error sending password reset email:", error); // Alert in case of error sending email
      // Specific error handling can be added here, such as showing a message to the user
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require("../../assets/logIn/mapDecoration.jpg")}
          resizeMode="cover"
        />
        <View style={styles.headerContainer}>
          <Text style={styles.loginText}>Recover Password</Text>
        </View>
      </View>
      {showVerification ? (
        <View style={{ ...styles.component, marginTop: "25%" }}>
          <SignUpEmail onBackToLogin={() => navigation.navigate("LogIn")} />
        </View>
      ) : (
        <View style={styles.component}>
          <View
            style={{ flexDirection: "row", marginBottom: 90, alignItems: "center" }}
          >
            <TouchableHighlight
              onPress={() => navigation.navigate("LogIn")}
              underlayColor="transparent"
            >
              <View style={{ flexDirection: "row", alignItems: "center"}}>
                <Ionicons name="chevron-back-outline" size={15} color="#FFF" />
                <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "200", marginLeft: 5 }}>Go back to </Text>
                <Text style={{color: "#FFA500", fontSize: 14, fontWeight: "400"}}>Log in</Text>
              </View>
            </TouchableHighlight>
          </View>
          <Formik
            initialValues={{ email: "" }}
            onSubmit={handleSubmit} 
          >
            {({ handleSubmit }) => (
              <View style={styles.form}>
                <FormItem
                  label="Email Address"
                  name="email"
                  placeholder="E-mail"
                />
                <TouchableHighlight
                  onPress={handleSubmit}
                  style={styles.loginButton}
                  underlayColor="#888"
                  activeOpacity={0.5}
                >
                  <Text style={styles.loginButtonText}>Send E-mail</Text>
                </TouchableHighlight>
              </View>
            )}
          </Formik>
        </View>
      )}
    </View>
  );
}

/**
 * Component for labeled form input field.
 * @param {Object} props - Component properties (label, name, and other field properties).
 * @returns {JSX.Element} React component for labeled input field.
 */
const FormItem = ({ label, name, ...props }) => {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.label}>{label}</Text>
      <FormikInputValue name={name} {...props} />
    </View>
  );
};

/**
 * Component for Formik form input field.
 * @param {Object} props - Component properties (name and other field properties).
 * @returns {JSX.Element} React component for Formik input field.
 */
const FormikInputValue = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name); // Formik useField hook for input field

  return (
    <>
      {/* StyledTextInput component for custom input field */}
      <StyledTextInput
        error={meta.touched && meta.error} // Show error if field is touched and there is an error
        value={field.value}
        onChangeText={(value) => helpers.setValue(value)} // onChangeText handler to set field value
        onBlur={() => helpers.setTouched(true)} // onBlur handler to set field as touched
        {...props} // Additional props for input field
      />
      <View style={styles.errorContainer}>
        {meta.touched && meta.error && (
          <Text style={styles.error}>{meta.error}</Text> // Show error message if there is an error in field
        )}
      </View>
    </>
  );
};

// CSS styles for password recovery screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#252525",
    marginTop: 200, // Adjusted top margin
  },
  imageContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%",
    marginBottom: 10
  },
  image: {
    width: "100%",
    height: 200,
  },
  title: {
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 42,
    color: "white",
    fontWeight: "900",
  },
  headerContainer: {
    position: "absolute",
    top: "35%",
    left: 30,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    marginLeft: 95,
    fontSize: 40,
    color: "#FFF",
    fontWeight: "900",
    textAlign: "center"
  },
  label: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 5,
    marginTop: 20,
    fontWeight: "300",
  },
  loginButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: "25%",
    marginVertical: 30,
    padding: 10,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
  },
  exitButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  errorContainer: {
    marginTop: 5,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
});
