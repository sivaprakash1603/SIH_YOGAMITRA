import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Alert } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import WifiManager from 'react-native-wifi-reborn';

const HomeScreen = ({ currentScreen, setCurrentScreen }) => {
  const [name, setName] = useState('');
  const [streak, setStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [noOFYogas, setNoOFYogas] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [instructionModalVisible, setInstructionModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setName(userData.name || '');
            setStreak(userData.streak || 0);
            setTotalTime(userData.totalTime || 0);
            setAvgTime(userData.avgTime || 0);
            setNoOFYogas(userData.noOfYogas || 0);
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

  const requestWiFiPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Wi-Fi permission granted');
        return true;
      } else {
        console.log('Wi-Fi permission denied');
        Alert.alert('Permission Denied', 'Wi-Fi access is required for this app to function properly.');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const connectToWifi = async (ssid, password) => {
    const permissionGranted = await requestWiFiPermission();
    if (!permissionGranted) return;

    try {
      const isEnabled = await WifiManager.isEnabled();
      if (!isEnabled) {
        await WifiManager.setEnabled(true);
      }

      await WifiManager.connectToProtectedSSID(ssid, password, false, false);
      Alert.alert('Success', `Connected to Wi-Fi network: ${ssid}`);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to Wi-Fi:', error);

      if (error.message.includes('failed to connect')) {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the Wi-Fi network. Please check your credentials and try again.'
        );
      } else {
        Alert.alert('Error', `Failed to connect: ${error.message}`);
      }

      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleConnection = async () => {
    if (!ssid || !password) {
      Alert.alert('Missing Information', 'Please enter both SSID and Password.');
      return;
    }
    setCurrentScreen('YogaScreen');
    /*
    setIsConnecting(true);
    setModalVisible(false);

    Keyboard.dismiss();

    try {
      await connectToWifi('ESP32-Config', '12345678');

      const response = await fetch('http://192.168.4.1/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}`,
      });

      if (response.ok) {
        setIsConnected(true);
        Alert.alert('Success', 'Connected to Wi-Fi network');
      } else {
        throw new Error('Failed to send credentials to ESP32');
      }
    } catch (error) {
      console.error('Error during connection process:', error);
      Alert.alert('Connection Error', 'Failed to connect to the ESP32 network or send credentials. Please try again.');
    } finally {
      setIsConnecting(false);
    }*/
  };

  const handleButtonPress = () => {
    if (isConnected) {
      setCurrentScreen('YogaScreen');
    } else {
      setModalVisible(true);
    }
  };

  const toggleInstructionModal = () => {
    setInstructionModalVisible(!instructionModalVisible);
  };

  const getIconColor = (screenName) => (currentScreen === screenName ? 'rgb(218,29,129)' : 'black');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgb(218,29,129)" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Other UI elements */}
      <View style={styles.appNameContainer}></View>
      <Text style={styles.appName}>YOGAMITRA</Text>

      <View style={styles.welcomeContainer}>
        <Text style={styles.helloText}>Hello,</Text>
        <Text style={styles.nameText}>{name}</Text>
      </View>

      <View style={styles.rowContainer}>
        <View style={styles.box1}>
          <Text style={styles.boxTitle}>Streak</Text>
          <Text style={styles.boxContent}>
            <Text style={styles.value}>{streak}</Text> days
          </Text>
        </View>

        <View style={styles.box2}>
          <Text style={styles.boxTitle}>Total Time</Text>
          <Text style={styles.boxContent}>
            <Text style={styles.value}>{totalTime}</Text> hrs
          </Text>
        </View>
      </View>

      <View style={styles.rowContainer}>
        <View style={styles.box3}>
          <Text style={styles.boxTitle}>Avg Time</Text>
          <Text style={styles.boxContent}>
            <Text style={styles.value}>{avgTime}</Text> min
          </Text>
        </View>

        <View style={styles.box4}>
          <Text style={styles.boxTitle}>No. of Yogas</Text>
          <Text style={styles.boxContent}>
            <Text style={styles.value}>{noOFYogas}</Text> nos
          </Text>
        </View>
      </View>
      <View style={styles.circularButtonContainer}>
        <TouchableOpacity
          style={[styles.circularButton, { backgroundColor: isConnected ? 'green' : 'rgb(225,170,70)' }]}
          onPress={handleButtonPress}
        >
          {isConnecting ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Icon name={isConnected ? 'checkmark' : 'wifi'} size={50} color="white" />
          )}
          <Text style={styles.circularButtonText}>{isConnected ? 'Start' : 'Connect'}</Text>
        </TouchableOpacity>
      </View>
      {/* Modal and other components */}
      
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Wi-Fi Credentials</Text>
            <TextInput
              style={styles.inputField}
              placeholder="SSID"
              placeholderTextColor={'#000'}
              value={ssid}
              onChangeText={setSsid}
            />
            <TextInput
              style={styles.inputField}
              placeholder="Password"
              placeholderTextColor={'#000'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.modalButton} onPress={toggleConnection}>
              <Text style={styles.modalButtonText}>Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'gray' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.instructionButton} onPress={toggleInstructionModal}>
        <Icon name="help-circle-outline" size={30} color="white" />
      </TouchableOpacity>

      {/* Instruction Modal */}
      <Modal
        visible={instructionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleInstructionModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>How to Use</Text>
            <Text style={styles.instructionText}>
              1. Turn on your Mobile Hotspot.
            </Text>
            <Text style={styles.instructionText}>
              2. Enter Wi-Fi SSID and Password to connect to your Yogamitra mat.
            </Text>
            <Text style={styles.instructionText}>
              3. Use the Connect button to establish the connection.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={toggleInstructionModal}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.bottomBar}>
        <Icon
          name="videocam"
          size={30}
          color={getIconColor('Tutorial')}
          onPress={() => setCurrentScreen('Tutorial')}
        />
        <Icon
          name="home"
          size={30}
          color={getIconColor('Home')}
          onPress={() => setCurrentScreen('Home')}
        />
        <Icon
          name="gift"
          size={30}
          color={getIconColor('Subscription')}
          onPress={() => setCurrentScreen('Subscription')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Your styles here */
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
    paddingHorizontal:0, // Added some horizontal padding for better spacing
  },
  value:{
    color:'#000',
    fontSize:55,
  },
  appNameContainer: {
    width: '120%',
    height: 65, // Height for the grey bar
    backgroundColor: 'white', // Grey color
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    position: 'absolute', // Position it at the top
    top: 0,
    left: 0,
    shadowColor: '#000',
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: 'rgb(218,29,129)', // White text for contrast
    letterSpacing: 3,
  },
  welcomeContainer: {
    alignItems: 'flex-start',
    marginTop: 35, // Adjusted top margin to make space for the grey bar
    paddingHorizontal: 10,
    alignSelf:'flex-start',
  },
  helloText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'rgb(218,29,129)',
  },
  nameText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  box1: {
    flex: 1,
    height: 150,
    backgroundColor: 'rgb(245,245,140)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  box2: {
    flex: 1,
    height: 150,
    backgroundColor: 'rgb(200,245,245)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  box3: {
    flex: 1,
    height: 150,
    backgroundColor: 'rgb(245,190,140)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  box4: {
    flex: 1,
    height: 150,
    backgroundColor: 'rgb(100,160,245)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgb(50,90,)',
    position: 'absolute',
    top: 10,
    left: 15,
  },
  boxContent: {
    fontSize: 30,
    fontWeight: '900',
    color: '#333',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    backgroundColor: '#ffffff', // Neutral background for the bottom bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  circularButtonContainer: {
    position: 'relative',
     // Positioned above the bottom bar
    alignItems: 'center',
    width: '100%',
    marginTop:60,
  },
  circularButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
  circularButtonText: {
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  modalButton: { backgroundColor: 'rgb(218,29,129)', padding: 10, borderRadius: 5, marginVertical: 5, alignItems: 'center' },
  modalButtonText: { color: 'white', fontWeight: '600' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  inputField: { borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginVertical: 10 },
  instructionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgb(218,29,129)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  modalButton: {
    backgroundColor: 'rgb(218,29,129)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
