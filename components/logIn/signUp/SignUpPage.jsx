import React, { useState } from "react";
import { View, StyleSheet, Text, Image, ScrollView } from "react-native";
import SignUpForm from "./SignUpForm";
import SignUpEmail from "./SignUpEmail";
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebase-config";
import { collection, doc, setDoc } from "firebase/firestore";
import LottieView from 'lottie-react-native';

/**
 * Component for the Sign Up Page.
 * Handles user registration using Firebase authentication.
 * @component
 * @returns {JSX.Element} Component for the Sign Up Page.
 */
export default function SignUpPage() {
  const navigation = useNavigation();
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  /**
   * Handles form submission for user registration.
   * @param {Object} values - Form values containing email, password, name, and username.
   * @returns {Promise<void>} Promise representing the registration operation.
   */
  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      // Send email verification to the registered user
      await sendEmailVerification(userCredential.user);
      console.log("Registration successful! Verification email has been sent.");
      setEmailSent(true);
      
      // Save additional user data to Firestore
      const userRef = doc(collection(FIRESTORE_DB, 'users'), userCredential.user.uid);
      await setDoc(userRef, { email: values.email, name: values.name, username: values.username });
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error registering user: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={require("../../../assets/logIn/mapDecoration.jpg")}
          resizeMode="cover"
        />
        <Text style={styles.title}>Sign Up</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.component}>
          {isLoading ? (
            <LottieView
              source={require("../../../assets/animations/userWave.json")}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          ) : (
            !emailSent ? (
              <SignUpForm onSubmit={handleSubmit} />
            ) : (
              <SignUpEmail onBackToLogin={() => navigation.navigate("LogIn")} />
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#252525",
  },
  imageContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%"
  },
  component: {
    marginTop: 10
  },
  image: {
    width: "100%",
    height: 200,
  },
  title: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 42,
    color: "white",
    fontWeight: "900",
  },
  scrollViewContent: {
    alignItems: "center",
  },
  loadingAnimation: {
    width: 350,
    height: 350,
    alignSelf: "center",
  },
});
