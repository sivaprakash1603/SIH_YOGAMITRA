import React, { useEffect, useRef, useState } from 'react';
import { StatusBar,Dimensions } from 'react-native';

import {
  View, 
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  Alert,
  BackHandler,  // Import BackHandler
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AboutScreen from './src/screens/AboutScreen';
import auth from '@react-native-firebase/auth';
import YogaScreen from './src/screens/YogaScreen';

const SPLASH_DURATION = 2000;

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [menuVisible, setMenuVisible] = useState(false);
  const [previousScreen, setPreviousScreen] = useState(null);  // Track the previous screen
 
  useEffect(() => {
    // Change the status bar color to match the background color of the screen
    StatusBar.setBarStyle('dark-content');  // Light text for dark background
    StatusBar.setBackgroundColor('rgb(220,220,220)');  // Set the status bar background color
  }, []);

  const SplashScreen = () => {
    const scaleValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(scaleValue, {
        toValue: 2,
        duration: SPLASH_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen('LoginScreen');
      });
    }, []);

    return (
      <View style={styles.splashContainer}>
        <Animated.Image
          source={require('./src/Assets/icon.png')}
          style={[styles.icon, { transform: [{ scale: scaleValue }] }]}>
        </Animated.Image>
      </View>
    );
  };

  const handleBackPress = () => {
    if (currentScreen === 'Splash') {
      return false;  // Allow the back press to close the app if on the Splash screen
    }

    if (previousScreen) {
      setCurrentScreen(previousScreen);
      return true;  // Prevent default back press action
    }

    return false; // Let the system handle the back press (exit the app)
  };

  useEffect(() => {
    // Add event listener to listen for Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup listener on component unmount
    return () => backHandler.remove();
  }, [currentScreen, previousScreen]);
  // eslint-disable-next-line react/no-unstable-nested-components
  const CustomMenu = () => {
    const handleLogout = async () => {
      try {
        await auth().signOut();
        Alert.alert('Logged out successfully');
        setMenuVisible(false);
        setCurrentScreen('LoginScreen');
      } catch (error) {
        console.error('Logout failed:', error.message);
        Alert.alert('Logout Failed', 'There was an issue logging out. Please try again.');
      }
    };

    return (
      <SafeAreaView style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setMenuVisible(false)}
        >
          <Icon name="close" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.menuHeader}>Menu</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setPreviousScreen(currentScreen);  // Store the previous screen
            setMenuVisible(false);
            setCurrentScreen('Profile');
          }}
        >
          <Icon name="person" size={24} color="white" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setPreviousScreen(currentScreen);  // Store the previous screen
            setMenuVisible(false);
            setCurrentScreen('History');
          }}
        >
          <Icon name="history" size={24} color="white" />
          <Text style={styles.menuText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setPreviousScreen(currentScreen);  // Store the previous screen
            setMenuVisible(false);
            setCurrentScreen('About');
          }}
        >
          <Icon name="info" size={24} color="white" />
          <Text style={styles.menuText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="logout" size={24} color="white" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const HomeWithMenu = ({setCurrentScreen,currentScreen}) => {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}
        >
          <Icon name="menu" size={30} color="black" />
        </TouchableOpacity>
        <HomeScreen setCurrentScreen={setCurrentScreen} currentScreen={currentScreen}/>
        <Modal
          transparent={true}
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <CustomMenu />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  };
  const TutWithMenu = ({setCurrentScreen,currentScreen}) => {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}
        >
          <Icon name="menu" size={30} color="black" />
        </TouchableOpacity>
        <TutorialScreen setCurrentScreen ={setCurrentScreen} currentScreen={currentScreen}/>
        <Modal
          transparent={true}
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <CustomMenu />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  };


  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen />;
      case 'LoginScreen':
        return <LoginScreen setCurrentScreen={setCurrentScreen} />;
      case 'SignUp':
        return <SignUpScreen setCurrentScreen={setCurrentScreen} />;
      case 'Home':
        return <HomeWithMenu setCurrentScreen={setCurrentScreen} currentScreen={'Home'}/>;
      case 'Tutorial':
        return <TutWithMenu setCurrentScreen ={setCurrentScreen} currentScreen={'Tutorial'}/>;
      case 'Profile':
        return <ProfileScreen setCurrentScreen={setCurrentScreen} />;
      case 'History':
        return <HistoryScreen setCurrentScreen={setCurrentScreen} />;
      case 'About':
        return <AboutScreen setCurrentScreen={setCurrentScreen} />;
      case 'YogaScreen':
        return <YogaScreen setCurrentScreen={setCurrentScreen}/>;
      default:
        return <SplashScreen />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};
const { height: screenHeight } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  icon: {
    width: 150,
    height: 150,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgb(255,255,255)',
    position: 'relative',
    margin:5,
    borderRadius:20,
    width:'70%',
    maxHeight: screenHeight / 2.2,
  },
  menuHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
    textAlign: 'left',
    marginLeft:30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderTopWidth: 1,
  },
  menuText: {
    fontSize: 18,
    color: '#000',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
});


export default App;
