import * as yup from 'yup';

export const signUpValidationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email().required('Email is required'),
  username: yup.string().required('Username is required'),
  password: yup.string().min(5, 'Password must be at least 5 characters').required('Password is required'),
  repeatPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Repeat Password is required'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms').required('You must agree to the terms'),
});
