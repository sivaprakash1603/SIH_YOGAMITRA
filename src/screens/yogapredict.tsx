import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

const bmiAsanas = {
  'Underweight': ['Trikonasana II', 'Ardhachandrasana', 'Eka Pada Utkatasana', 'Natarajasana'],
  'Normal': ['Trikonasana II', 'Ardhachandrasana', 'Eka Pada Utkatasana', 'Natarajasana'],
  'Overweight': ['Virabhadrasana I', 'Virabhadrasana II', 'Utthita Parsvakonasana', 'Utkatasana'],
  'Obese': ['Tadasana', 'Dandasana', 'Uttanasana', 'Malasana']
};

const diabetesAsanas = [
  'Trikonasana', 'Tadasana', 'Sarvangasana', 'Urdhva Mukha Svanasana',
  'Supta Matsyendrasana', 'Paschimottanasana', 'Ardha Matsyendrasana',
  'Uttanasana', 'Bhujangasana', 'Vajrasana', 'Dhanurasana',
  'Shavasana', 'Balasana', 'Viparita Karani', 'Mandukasana',
  'Chakrasana', 'Halasana', 'Paschimottanasana', 'Supta Baddha Konasana'
];

const bpAsanas = [
  'Balasana', 'Paschimottanasana', 'Janu Sirsasana', 'Baddha Konasana',
  'Savasana', 'Virasana'
];

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  else if (bmi >= 18.5 && bmi < 24.9) return 'Normal';
  else if (bmi >= 25 && bmi < 29.9) return 'Overweight';
  else return 'Obese';
};

const getRandomElements = (arr, num) => {
  const result = [];
  const tempArr = [...arr];
  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * tempArr.length);
    result.push(tempArr.splice(randomIndex, 1)[0]);
  }
  return result;
};

const assignYoga = ({ BMI, GlucoseLevel, BloodPressure }) => {
  let poses = [];
  const bmiCategory = getBmiCategory(BMI);

  if (bmiAsanas[bmiCategory]) {
    poses = poses.concat(getRandomElements(bmiAsanas[bmiCategory], 3));
  }

  if (GlucoseLevel < 70 || GlucoseLevel > 140) {
    poses = poses.concat(getRandomElements(diabetesAsanas, 3));
  }

  if (BloodPressure > 140) {
    if (bmiCategory === 'Normal' || bmiCategory === 'Underweight') {
      poses = poses.concat(getRandomElements(bmiAsanas['Obese'], 2));
      poses = poses.concat(getRandomElements(bmiAsanas['Overweight'], 1));
    } else {
      poses = poses.concat(getRandomElements(bpAsanas, 3));
    }
  }

  return poses;
};

const YogaSuggestionScreen = () => {
  const [suggestedPoses, setSuggestedPoses] = useState([]);
  const [biometrics, setBiometrics] = useState({ BMI: 0, GlucoseLevel: 0, BloodPressure: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch BMI from Firestore
        const userDoc = await firestore().collection('users').doc('userId').get();
        const userBMI = userDoc.data()?.bmi || 0;

        // Fetch Glucose and BP from Realtime Database
        const realtimeRef = database().ref('/test');
        realtimeRef.on('value', (snapshot) => {
          const data = snapshot.val();
          const glucose = data?.Glucose || 0;
          const bp = data?.bp || 0;

          // Set biometrics state
          const newBiometrics = { BMI: userBMI, GlucoseLevel: glucose, BloodPressure: bp };
          setBiometrics(newBiometrics);

          // Get yoga suggestions
          const poses = assignYoga(newBiometrics);
          setSuggestedPoses(poses);
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Suggested Yoga Poses</Text>
      <View style={styles.poseContainer}>
        {suggestedPoses.map((pose, index) => (
          <Text key={index} style={styles.pose}>
            {pose}
          </Text>
        ))}
      </View>

      <View style={styles.biometricContainer}>
        <Text style={styles.biometric}>BMI: {biometrics.BMI}</Text>
        <Text style={styles.biometric}>Glucose Level: {biometrics.GlucoseLevel}</Text>
        <Text style={styles.biometric}>Blood Pressure: {biometrics.BloodPressure}</Text>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  poseContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  pose: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
  },
  biometricContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  biometric: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default YogaSuggestionScreen;
