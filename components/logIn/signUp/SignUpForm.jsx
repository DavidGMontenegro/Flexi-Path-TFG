import React from "react";
import { View, TouchableHighlight, StyleSheet, Text } from "react-native";
import { Formik, useField } from "formik";
import StyledTextInput from "../StyledTextInput";
import { useNavigation } from "@react-navigation/native";
import { signUpValidationSchema } from "../../validationSchemas/signup";

/**
 * Component for the Sign Up Form.
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onSubmit - Function to handle form submission.
 * @returns {JSX.Element} Sign Up Form component.
 */
export default function SignUpForm({ onSubmit }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Formik
        validationSchema={signUpValidationSchema}
        onSubmit={onSubmit}
      >
        {({ handleSubmit }) => {
          return (
            <>
              <View style={styles.returnToEmail}>
                <Text
                  style={{ color: "#FFF", fontSize: 16, fontWeight: "200" }}
                >
                  {"Already have an account? "}
                </Text>
                <TouchableHighlight
                  onPress={() => navigation.navigate("LogIn")}
                  underlayColor="transparent"
                >
                  <Text
                    style={{
                      color: "#FFA500",
                      fontSize: 16,
                      fontWeight: "400",
                    }}
                  >
                    Log in
                  </Text>
                </TouchableHighlight>
              </View>
              <View style={styles.form}>
                <FormItem label="Your name" name="name" placeholder="Name" />
                <FormItem label="Email Address" name="email" placeholder="E-mail" />
                <FormItem label="Username" name="username" placeholder="Username" />
                <FormItem label="Password" name="password" placeholder="Password" secureTextEntry />
                <FormItem label="Repeat password" name="repeatPassword" placeholder="Repeat your password" secureTextEntry />

                <View style={styles.checkboxContainer}>
                  <TouchableHighlight
                    onPress={() => console.log("Acepto Términos")}
                    underlayColor="transparent"
                  >
                    <View style={styles.checkbox}>
                    </View>
                  </TouchableHighlight>
                  <Text style={styles.checkboxLabel}>I agree to the </Text>
                  <TouchableHighlight
                    onPress={() => navigation.navigate("TermsOfService")}
                    underlayColor="transparent"
                  >
                    <Text style={styles.termsLink}>Terms of Service</Text>
                  </TouchableHighlight>
                </View>

                <TouchableHighlight
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  underlayColor="#888"
                  activeOpacity={0.5}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableHighlight>
              </View>
            </>
          );
        }}
      </Formik>
    </View>
  );
}

/**
 * Form item component for rendering input fields.
 * @param {Object} props - Component props.
 * @param {string} props.label - Label for the input field.
 * @param {string} props.name - Name of the input field.
 * @param {Object} props.placeholder - Placeholder text for the input field.
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
 * Custom input component connected to Formik.
 * @param {Object} props - Component props.
 * @param {string} props.name - Name of the input field.
 * @returns {JSX.Element} Formik input component.
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252525",
  },
  returnToEmail: {
    display: "flex",
    flexDirection: "row",
  },
  form: {
    margin: 12,
  },
  label: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "300",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  checkboxText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "400",
  },
  checkboxLabel: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "200",
  },
  termsLink: {
    color: "#FFA500",
    fontSize: 14,
    fontWeight: "400",
  },
  submitButton: {
    backgroundColor: "#2E86C1",
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: "15%",
    padding: 10,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
  },
  errorContainer: {
    minHeight: 10,
    marginTop: 0,
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 20,
  },
});
