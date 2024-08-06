import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { Formik, useField } from "formik";
import StyledTextInput from "../../logIn/StyledTextInput";
import PasswordConfirm from "./PasswordConfirm";
import { FIREBASE_AUTH } from "../../../firebase-config";
import { EmailAuthProvider } from "firebase/auth";
import { updatePassword, reauthenticateWithCredential } from "firebase/auth";
import * as yup from "yup";

/**
 * Component for changing user password.
 * @param {object} props - Component props.
 * @param {object} props.navigation - Navigation object for React Navigation.
 * @param {Function} props.onBackPress - Function to handle back press.
 * @returns {JSX.Element} ChangePassword component.
 */
const ChangePassword = ({ navigation, onBackPress }) => {
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false); // Estado para controlar la visibilidad de PasswordConfirm
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /**
   * Function to authenticate user with current password.
   * @returns {Promise<void>} Promise indicating completion of authentication.
   */
  const authenticateUser = () => {
    const user = FIREBASE_AUTH.currentUser;
    const credential = EmailAuthProvider.credential(user.email, current);
    return reauthenticateWithCredential(user, credential);
  };

  /**
   * Function to change user's password.
   * @returns {void}
   */
  const changePassword = () => {
    authenticateUser()
      .then(() => {
        const user = FIREBASE_AUTH.currentUser;
        return updatePassword(user, newPassword);
      })
      .then(() => {
        console.log('Contraseña actualizada exitosamente.');
      })
      .catch((error) => {
        console.error('Error al actualizar la contraseña:', error.message);
      });
  };

  /**
   * Function to handle form submission.
   * @param {object} values - Form values containing current and new passwords.
   * @returns {void}
   */
  const handleSubmit = (values) => {
    setCurrent(values.current);
    setNewPassword(values.new);

    authenticateUser(values)
      .then(() => {
        setShowPasswordConfirm(true);
      })
      .catch((error) => {
        alert("Wrong password.");
      });
  };

  return (
    <View style={styles.container}>
      {!showPasswordConfirm && (
        <Formik
          initialValues={{ current: "", new: "", repeatNew: "" }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <View style={styles.form}>
              <FormItem
                label="Current password"
                name="current"
                placeholder="Current password"
              />
              <FormItem
                label="New password"
                name="new"
                placeholder="New password"
              />
              <FormItem
                label="Repeat password"
                name="repeatNew"
                placeholder="Repeat password"
              />
              <View style={styles.saveContainer}>
                <TouchableHighlight
                  onPress={handleSubmit}
                  style={styles.saveButton}
                  underlayColor="#888"
                  activeOpacity={0.5}
                >
                  <Text style={{ color: "white", fontSize: 14 }}>
                    Change Password
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          )}
        </Formik>
      )}
      {showPasswordConfirm && (
        <PasswordConfirm onBackPress={onBackPress} onSavePress={changePassword} />
      )}
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
  const [field, meta, helpers] = useField(name);

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.label}>{label}</Text>
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
  form: {
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
  },
  saveContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#FFA500",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
});

// Definir el schema de validación con yup
const validationSchema = yup.object().shape({
  current: yup.string().required("Actual password is needed"),
  new: yup
    .string()
    .required("New password is needed")
    .min(6, "Must be at least 6 characters long"),
  repeatNew: yup
    .string()
    .required("Repeated password is needed")
    .oneOf([yup.ref("new")], "Passwords don´t match"),
});

export default ChangePassword;
