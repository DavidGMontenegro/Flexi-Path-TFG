import React, { useState } from "react";
import {
  View,
  TouchableHighlight,
  StyleSheet,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { Formik, useField } from "formik";
import { loginValidationSchema } from "../validationSchemas/login";
import StyledTextInput from "./StyledTextInput";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, FIREBASE_AUTH, FIRESTORE_DB } from "../../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerFollowMasterID } from "native-notify";

const initialValues = {
  email: "",
  password: "",
};

/**
 * Component for the Login Page.
 * Handles user login using Firebase authentication.
 * @component
 * @returns {JSX.Element} Component for the Login Page.
 */
export default function LoginPage() {
  const navigation = useNavigation();
  const { setIsLoggedIn, setUsername, setEmail, setName, setUid, setCurrentUser } = useAuth();
  const auth = FIREBASE_AUTH;
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission for user login.
   * @param {Object} values - Form values containing email and password.
   * @returns {Promise<void>} Promise representing the login operation.
   */
  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      if (response.user.emailVerified) {
        setIsLoggedIn(true);

        const userDocRef = doc(FIRESTORE_DB, "users", response.user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUsername(userData.username);
          setName(userData.name);
          setEmail(userData.email);
          setUid(response.user.uid);
          
          const authData = {
            username: userData.username,
            name: userData.name,
            email: userData.email,
            uid: response.user.uid,
            currentUser: response.user,
            allowNotifications: true
          };
          
          try {
            await AsyncStorage.setItem('user', JSON.stringify(authData));
          } catch (error) {
            console.error("Failed to save user data to AsyncStorage", error);
          }

          registerFollowMasterID(
            response.user.uid,
            21031,
            '6y2Y9hdgxLHvd9DtOgZxwW'
          );
        } else {
          console.log("User document does not exist.");
        }
        setCurrentUser(response.user);
        navigation.navigate("Home");
      } else {
        alert(
          "Please verify your email address to continue."
        );
      }
    } catch (error) {
      console.log(error);
      alert("sign in failed: " + error.message);
    } finally {
      setIsLoading(false);
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
          <TouchableHighlight
            onPress={() => navigation.navigate("Home")}
            underlayColor="#2E86C100"
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableHighlight>
          <Text style={styles.loginText}>Log In</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {isLoading ? (
          <LottieView
            source={require("../../assets/animations/userWave.json")}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        ) : (
          <Formik
            validationSchema={loginValidationSchema}
            initialValues={initialValues}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit }) => (
              <View style={styles.form}>
                <FormItem
                  label="Email Address"
                  name="email"
                  placeholder="E-mail"
                />
                <FormItem
                  label="Password"
                  name="password"
                  placeholder="Password"
                  secureTextEntry
                />
                <View style={{ marginBottom: 40, alignItems: "flex-end" }}>
                  <TouchableHighlight
                    onPress={() => navigation.navigate("RecoverPassword")}
                    underlayColor="#ffffff00"
                  >
                    <Text style={styles.recoverPassword}>Recover Password</Text>
                  </TouchableHighlight>
                </View>
                <TouchableHighlight
                  onPress={handleSubmit}
                  style={styles.loginButton}
                  underlayColor="#888"
                  activeOpacity={0.5}
                >
                  <Text style={styles.loginButtonText}>Submit</Text>
                </TouchableHighlight>
              </View>
            )}
          </Formik>
        )}
        <View style={styles.orContainer}>
          <View style={styles.horizontalLine} />
          <Text style={styles.orText}>Or Continue</Text>
          <View style={styles.horizontalLine} />
        </View>
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>New user? </Text>
          <TouchableHighlight
            onPress={() => navigation.navigate("SignUp")}
            underlayColor="transparent"
          >
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Component for a form input item.
 * @param {Object} props - Properties for the form input item (label, name, and other input props).
 * @returns {JSX.Element} Form input item component.
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
 * Component for a form input item using Formik.
 * @param {Object} props - Properties for the Formik form input item (name and other input props).
 * @returns {JSX.Element} Form input item component using Formik.
 */
const FormikInputValue = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name);

  return (
    <>
      <StyledTextInput
        error={meta.touched && meta.error}
        value={field.value}
        onChangeText={(value) => helpers.setValue(value)}
        onBlur={() => helpers.setTouched(true)}
        {...props}
      />
      <View style={styles.errorContainer}>
        {meta.touched && meta.error && (
          <Text style={styles.error}>{meta.error}</Text>
        )}
      </View>
    </>
  );
};

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
    width: "100%",
  },
  image: {
    width: "100%",
    height: 200,
  },
  headerContainer: {
    position: "absolute",
    top: "50%",
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
  },
  form: {
    margin: 12,
    marginTop: 125,
  },
  label: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "300",
  },
  recoverPassword: {
    color: "#FFA500",
    fontSize: 16,
    textAlign: "right",
    fontWeight: "400",
  },
  loginButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: "15%",
    padding: 10,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  horizontalLine: {
    borderBottomColor: "#FFF",
    borderBottomWidth: 0.45,
    flex: 1,
    marginHorizontal: 30,
  },
  orText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "300",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  signUpText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "200",
  },
  signUpLink: {
    color: "#FFA500",
    fontSize: 16,
    fontWeight: "400",
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
  scrollViewContent: {
    alignItems: "center",
  },
  loadingAnimation: {
    width: 300,
    height: 300,
    alignSelf: "center",
  },
});
