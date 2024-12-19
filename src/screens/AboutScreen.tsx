import React from 'react';
import {Text, StyleSheet, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.description}>
        Welcome to our Yoga App! This application is designed to help you embark on a journey of physical and mental well-being through yoga.
      </Text>
      <Text style={styles.sectionTitle}>Features:</Text>
      <Text style={styles.feature}>- Learn yoga poses step-by-step</Text>
      <Text style={styles.feature}>- Track your daily progress</Text>
      <Text style={styles.feature}>- Connect with a community of yoga enthusiasts</Text>
      <Text style={styles.feature}>- Access personalized yoga plans</Text>

      <Text style={styles.sectionTitle}>Our Vision:</Text>
      <Text style={styles.description}>
        To make yoga accessible to everyone, anywhere, and empower individuals to lead a healthier and more mindful life.
      </Text>

      <Text style={styles.sectionTitle}>Contact Us:</Text>
      <Text style={styles.contact}>Email: support@yogaapp.com</Text>
      <Text style={styles.contact}>Phone: +1 (234) 567-8900</Text>
      <Text style={styles.contact}>Website: www.yogaapp.com</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feature: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  contact: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});

export default AboutScreen;
