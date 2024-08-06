import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableHighlight, Alert } from "react-native";
import { Formik, useField } from "formik";
import StyledTextInput from "../../logIn/StyledTextInput";
import { useAuth } from "../../../AuthContext";
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from "../../../firebase-config";
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Component for editing user profile information and managing account actions.
 * @param {object} props - Component props.
 * @param {object} props.navigation - Navigation object for React Navigation.
 * @param {Function} props.onSelectOption - Function to handle selecting options.
 * @param {Function} props.onDeleteAccount - Function to handle account deletion.
 * @returns {JSX.Element} EditProfile component.
 */
const EditProfile = ({ navigation, onSelectOption, onDeleteAccount }) => {
  const { setUid, setName, setEmail, setUsername, setIsLoggedIn, name, email, username, uid, currentUser } = useAuth();
  const [showPasswordField, setShowPasswordField] = useState(false);

  /**
   * Function to handle form submission for updating user profile information.
   * @param {object} values - Form values containing updated user information.
   * @returns {void}
   */
  const handleSubmit = async (values) => {
    if (!values.name && !values.email && !values.username) {
      alert("Por favor, completa al menos uno de los campos.");
      return;
    }

    if ((name !== values.name || email !== values.email || username !== values.username)) {
      const userDocRef = doc(FIRESTORE_DB, 'users', uid);

      const updatedUserData = {
        name: values.name || name,
        email: values.email || email,
        username: values.username || username,
      };

      try {
        await updateDoc(userDocRef, updatedUserData);

        if (values.email && email !== values.email) {
          await currentUser.updateEmail(values.email);
        }

        setEmail(updatedUserData.email);
        setUsername(updatedUserData.username);
        setName(updatedUserData.name);
        onSelectOption("none");
        console.log('Datos del usuario actualizados correctamente.');
      } catch (error) {
        console.error('Error al actualizar los datos del usuario:', error);
      }
    } else {
      alert("Cambia al menos alguno de los datos.");
    }
  };

  /**
   * Function to reauthenticate user with current password.
   * @param {string} password - User's current password.
   * @returns {Promise<boolean>} Promise indicating success of reauthentication.
   */
  const reauthenticate = async (password) => {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error('Error en la reautenticación:', error);
      Alert.alert('Error', 'No se pudo reautenticar. Por favor, intente nuevamente.');
      return false;
    }
  };

  /**
   * Function to handle account deletion process.
   * @param {object} values - Form values containing password for reauthentication.
   * @returns {void}
   */
  const handleRemoveAccount = async (values) => {
    const isReauthenticated = await reauthenticate(values.password);
    if (!isReauthenticated) return;

    try {
      await deleteDoc(doc(FIRESTORE_DB, 'users', uid));
      onDeleteAccount()
      await deleteUser(currentUser);
      await AsyncStorage.removeItem('user');
      setIsLoggedIn(false);
      setUsername('')
      setName('')
      setEmail('')
      setUid('')
      onSelectOption("none");
      navigation.navigate("LogIn")
      console.log('Cuenta eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      Alert.alert('Error', 'No se pudo eliminar la cuenta. Por favor, intenta nuevamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ name: "", email: "", username: "", password: "" }}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <View style={styles.form}>
            {!showPasswordField ? (
              <>
                <FormItem
                  label="Your name"
                  name="name"
                  placeholder={name}
                  value={values.name}
                />
                <FormItem
                  label="Email address"
                  name="email"
                  placeholder={email}
                  value={values.email}
                />
                <FormItem
                  label="Username"
                  name="username"
                  placeholder={username}
                  value={values.username}
                />
                <TouchableHighlight
                  onPress={handleSubmit}
                  style={styles.saveButton}
                  underlayColor="#888"
                  activeOpacity={0.5}
                >
                  <Text style={{ fontSize: 14 }}>Save</Text>
                </TouchableHighlight>
                <View style={styles.actionsContainer}>
                  <TouchableHighlight
                    onPress={() => onSelectOption("ChangePassword")}
                    style={styles.changePasswordButton}
                    underlayColor="#888"
                  >
                    <Text style={{ color: "white", fontSize: 14 }}>
                      Change password
                    </Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    onPress={() => setShowPasswordField(true)}
                    style={styles.removeAccountButton}
                    underlayColor="#888"
                    activeOpacity={0.5}
                  >
                    <Text style={{ color: "white", fontSize: 14 }}>Remove Account</Text>
                  </TouchableHighlight>
                </View>
              </>
            ) : (
              <>
                <FormItem
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  value={values.password}
                  secureTextEntry={true}
                />
                <TouchableHighlight
                  onPress={() => handleRemoveAccount(values)}
                  style={styles.confirmRemoveButton}
                  underlayColor="#888"
                  activeOpacity={0.5}
                >
                  <Text style={{ color: "white", fontSize: 14 }}>Confirm Remove Account</Text>
                </TouchableHighlight>
              </>
            )}
          </View>
        )}
      </Formik>
    </View>
  );
};

/**
 * Form item component for rendering form inputs with validation.
 * @param {object} props - Component props.
 * @param {string} props.label - Label text for the input.
 * @param {string} props.name - Field name for Formik.
 * @param {object} props.props - Additional props passed to StyledTextInput.
 * @returns {JSX.Element} Form item component.
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
 * Custom input component using Formik and StyledTextInput.
 * @param {object} props - Component props.
 * @param {string} props.name - Field name for Formik.
 * @param {object} props.props - Additional props passed to StyledTextInput.
 * @returns {JSX.Element} Custom input component.
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
        placeholderTextColor="#00000090"
        style={styles.input}
        {...props}
      />
      {meta.touched && meta.error && (
        <Text style={styles.error}>{meta.error}</Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#808080",
    borderRadius: 15,
    marginTop: 10,
    paddingVertical: 15,
  },
  form: {
    flexDirection: "column",
    marginHorizontal: 20,
  },
  itemContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#FFF",
    fontSize: 14,
  },
  input: {
    width: 275,
    backgroundColor: "#25252550",
    opacity: 0.9,
    color: "white",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#FFA500",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  changePasswordButton: {
    backgroundColor: "#252525",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeAccountButton: {
    backgroundColor: "#252525",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  confirmRemoveButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default EditProfile;
