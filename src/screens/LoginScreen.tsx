import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen = ({ setCurrentScreen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleLoginError = (error) => {
    let errorMessage = 'Login Failed';
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else {
      errorMessage = error.message;
    }
    Alert.alert('Login Failed', errorMessage);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Check if the email is verified
      if (!user.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Your email is not verified. Please verify your email and try again.',
          [
            {
              text: 'Resend Verification Email',
              onPress: async () => {
                try {
                  await user.sendEmailVerification();
                  Alert.alert('Verification Email Sent', 'Please check your inbox.');
                } catch (error) {
                  Alert.alert('Error', 'Failed to resend verification email.');
                }
              },
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
        await auth().signOut(); // Sign out the user as they can't proceed without verification
        return;
      }

      // Check if the user has completed their profile
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists && userDoc.data().profileCompleted) {
        // Set screen to 'Home' if the profile is complete
        Alert.alert('Login Success', `Welcome back, ${email}!`);
        setCurrentScreen('Home');
      } else {
        // Set screen to 'Profile' if profile is incomplete
        Alert.alert('Complete Your Profile', 'Redirecting to the profile setup screen.');
        setCurrentScreen('Profile');
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Reset Email Sent',
        'A password reset link has been sent to your email address.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../Assets/icon.png')} style={styles.logo} />

      {/* Header */}
      <Text style={styles.header}>Welcome Back!</Text>
      <Text style={styles.subHeader}>Log in to continue</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Icon name="mail" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor="grey"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock-closed" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="grey"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Forgot Password */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      {/* Sign-Up Navigation */}
      <Text style={styles.signupText}>
        Don't have an account?{' '}
        <Text
          style={styles.signupTextLink}
          onPress={() => setCurrentScreen('SignUp')}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f7f7f7',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  forgotPassword: {
    color: '#FF5757',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
  },
  button: {
    height: 50,
    backgroundColor: '#FF5757',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#FFB5B5',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  signupText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  signupTextLink: {
    color: '#FF5757',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
