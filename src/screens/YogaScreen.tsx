import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, Alert, Modal } from 'react-native';
import Video from 'react-native-video'; // To display the video
import firestore from '@react-native-firebase/firestore'; // Import Firestore (Assuming it's properly configured)
import auth from '@react-native-firebase/auth';

const YogaScreen = ({ setCurrentScreen }) => {
  const [biometrics, setBiometrics] = useState({
    bp: 'Loading...',
    glucose: 'Loading...',
    spo2: 'Loading...',
    temp: 'Loading...',
  });

  const [completedYoga, setCompletedYoga] = useState({}); // To track completion status
  const [showReport, setShowReport] = useState(false); // To display the session report
  const [totalCalories, setTotalCalories] = useState(0); // To accumulate calories burned

  const yogaData = [
    {
      id: 1,
      name: 'Bhujangasana',
      image: require('../Assets/cobrapose.jpg'),
      description: 'A backbend pose that strengthens the spine and opens the chest.',
      video: require('../Assets/cobrapose.mp4'),
      instructions: [
        'Lie flat on your stomach, place your hands under your shoulders.',
        'Inhale as you lift your chest and head while arching your back.',
        'Engage your core and keep your elbows slightly bent.',
        'Look upward and hold for 10-15 seconds.',
      ],
      calories: 50,
      efficiency: 85,
    },
    {
      id: 2,
      name: 'Balasana',
      image: require('../Assets/childpose.jpg'),
      description: 'A restful pose that stretches the back and helps to relax.',
      video: require('../Assets/childpose.mp4'),
      instructions: [
        'Sit back on your heels and fold forward, bringing your forehead to the mat.',
        'Extend your arms in front of you or alongside your body.',
        'Focus on deep, calming breaths as you relax your back and shoulders.',
        'Stay in this position for 30 seconds to 1 minute.',
      ],
      calories: 30,
      efficiency: 90,
    },
    {
      id: 3,
      name: 'Navasana',
      image: require('../Assets/navasana.jpg'),
      description: 'A core-strengthening pose that builds balance and stability.',
      video: require('../Assets/navasana.mp4'),
      instructions: [
        'Sit on the floor with your legs extended in front of you.',
        'Lean back slightly and lift your legs to a 45-degree angle.',
        'Extend your arms forward, parallel to the ground.',
        'Engage your core and hold the position for 10-15 seconds.',
      ],
      calories: 40,
      efficiency: 80,
    },
    {
      id: 4,
      name: 'Trikonasana',
      image: require('../Assets/trikonasana.jpg'),
      description: 'A standing pose that stretches the legs, hips, and spine.',
      video: require('../Assets/trikonasana.mp4'),
      instructions: [
        'Stand with your legs wide apart, arms extended parallel to the ground.',
        'Turn your right foot out, bend at the waist, and reach your right hand down to your ankle.',
        'Extend your left arm upwards, keeping both arms aligned.',
        'Look at your left hand and hold the position for 20-30 seconds.',
      ],
      calories: 60,
      efficiency: 88,
    },
  ];

  useEffect(() => {
    // Simulate fetching biometrics data
    setBiometrics({
      BPM: '82',
      glucose: '78.3 mg/dL',
      spo2: '94%',
      temp: '96°F',
    });
  }, []);

  const markAsCompleted = async (yoga) => {
    // Mark this yoga session as completed
    setCompletedYoga((prev) => ({
      ...prev,
      [yoga.id]: true,
    }));

    // Update total calories
    setTotalCalories((prev) => prev + yoga.calories);

    // Check if all sessions are completed
    const allCompleted = Object.keys(completedYoga).length === yogaData.length - 1;
    if (allCompleted) {
      setShowReport(true);
    }

    Alert.alert('Yoga Completed', `${yoga.name} is completed!`);
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setCurrentScreen('Home');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.yogaName}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Video source={item.video} style={styles.video} paused={true} controls={true} />
      <Text style={styles.instructionsTitle}>Instructions:</Text>
      {item.instructions.map((instruction, index) => (
        <Text key={index} style={styles.instructions}>{`• ${instruction}`}</Text>
      ))}

      {/* Mark as Completed Button */}
      <TouchableOpacity
        style={[
          styles.completedButton,
          { backgroundColor: completedYoga[item.id] ? '#2ecc71' : '#e74c3c' },
        ]}
        onPress={() => markAsCompleted(item)}
        disabled={completedYoga[item.id]} // Disable if already completed
      >
        <Text style={styles.completedButtonText}>
          {completedYoga[item.id] ? 'Completed' : 'Mark as Completed'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('Home')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yoga Screen</Text>
      </View>

      {/* Biometrics Tabs */}
      <View style={styles.rowContainer}>
        <View style={styles.tab}>
          <Text style={styles.tabTitle}>BPM</Text>
          <Text style={styles.tabValue}>{biometrics.BPM}</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabTitle}>Glucose</Text>
          <Text style={styles.tabValue}>{biometrics.glucose}</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabTitle}>SpO2</Text>
          <Text style={styles.tabValue}>{biometrics.spo2}</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabTitle}>Temp</Text>
          <Text style={styles.tabValue}>{biometrics.temp}</Text>
        </View>
      </View>

      {/* Swipeable Yoga Cards */}
      <FlatList
        data={yogaData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        style={styles.flatList}
      />

      {/* Modal for session report */}
      <Modal
        visible={showReport}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseReport}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Session Report</Text>
            <Text style={styles.modalText}>Total Calories Burned: {totalCalories}</Text>
            <Text style={styles.modalText}>Efficiency: {/* You can calculate or display the efficiency here */}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseReport}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.footer}>
  <TouchableOpacity
    style={styles.footerButton}
    onPress={() => setCurrentScreen('Yoga')} // Replace 'YogaPage' with your actual Yoga page identifier
  >
    <Text style={styles.footerButtonText}>Go to Yoga Page</Text>
  </TouchableOpacity>
</View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3498db',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: 15,
  },
  backButton: {
    marginRight: 10,
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    height: 100,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 4,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555',
  },
  tabValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  flatList: {
    marginTop: 20,
  },
  card: {
    width: width - 40,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  yogaName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginVertical: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  instructions: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  completedButton: {
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  completedButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width - 40,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalText: {
    fontSize: 16,
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default YogaScreen;
