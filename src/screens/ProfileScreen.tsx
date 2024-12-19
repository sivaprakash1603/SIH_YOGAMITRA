import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          setUserId(user.uid); // Get the authenticated user's UID
          const userDoc = await firestore().collection('users').doc(user.uid).get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            setName(userData.name || '');
            setAge(userData.age?.toString() || ''); // Convert age to string
            setHeight(userData.height?.toString() || ''); // Convert height to string
            setWeight(userData.weight?.toString() || ''); // Convert weight to string
            setBmi(userData.bmi?.toFixed(2) || ''); // Convert BMI to string with 2 decimals
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        Alert.alert('Error', 'Could not load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100; // Convert height from cm to meters
    if (weight > 0 && heightInMeters > 0) {
      return weight / (heightInMeters ** 2);
    }
    return 0; // Return 0 for invalid inputs
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'No user ID found.');
      return;
    }

    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(height);

    if (!weightValue || !heightValue || weightValue <= 0 || heightValue <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid height and weight values.');
      return;
    }

    const calculatedBMI = calculateBMI(weightValue, heightValue);

    try {
      await firestore().collection('users').doc(userId).update({
        name,
        age: parseInt(age, 10), // Convert age to number
        height: heightValue, // Convert height to number
        weight: weightValue, // Convert weight to number
        bmi: calculatedBMI, // Save calculated BMI
        profileCompleted: true, // Mark profile as complete
      });
      setBmi(calculatedBMI.toFixed(2)); // Update BMI in state
      setEditing(false);
      Alert.alert('Profile Updated', `Your profile has been updated. BMI: ${calculatedBMI.toFixed(2)}`);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      Alert.alert('Error', 'Could not update profile. Please try again later.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {/* Name Section */}
      <View style={styles.metricSection}>
        <Text style={styles.metricHeader}>Name</Text>
        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={[styles.input, editing ? styles.editable : styles.readOnly]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={'#000'}
            editable={editing}
          />
        </View>
      </View>

      {/* Age Section */}
      <View style={styles.metricSection}>
        <Text style={styles.metricHeader}>Age</Text>
        <View style={styles.inputContainer}>
          <Icon name="calendar" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={[styles.input, editing ? styles.editable : styles.readOnly]}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor={'#000'}
            keyboardType="numeric"
            editable={editing}
          />
        </View>
      </View>

      {/* Height Section */}
      <View style={styles.metricSection}>
        <Text style={styles.metricHeader}>Height (cm)</Text>
        <View style={styles.inputContainer}>
          <Icon name="arrow-up" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={[styles.input, editing ? styles.editable : styles.readOnly]}
            value={height}
            onChangeText={setHeight}
            placeholder="Enter height (cm)"
            keyboardType="numeric"
            placeholderTextColor={'#000'}
            editable={editing}
          />
        </View>
      </View>

      {/* Weight Section */}
      <View style={styles.metricSection}>
        <Text style={styles.metricHeader}>Weight (kg)</Text>
        <View style={styles.inputContainer}>
          <Icon name="fitness" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={[styles.input, editing ? styles.editable : styles.readOnly]}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight (kg)"
            keyboardType="numeric"
            placeholderTextColor={'#000'}
            editable={editing}
          />
        </View>
      </View>

      {/* BMI Section */}
      <View style={styles.metricSection}>
        <Text style={styles.metricHeader}>BMI</Text>
        <View style={styles.inputContainer}>
          <Icon name="stats-chart" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={bmi}
            editable={false} // BMI is non-editable
            placeholderTextColor={'#000'}
            placeholder="BMI will be calculated"
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {editing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  metricSection: {
    marginBottom: 20,
  },
  metricHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  editable: {
    backgroundColor: '#fff',
  },
  readOnly: {
    backgroundColor: '#fff', // Light gray for read-only fields
  },
  buttonContainer: {
    marginTop: 30,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
