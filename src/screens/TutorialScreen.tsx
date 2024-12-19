import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

const TutorialScreen = ({ setCurrentScreen, currentScreen }) => {
  const [paused, setPaused] = useState(true); // Control play/pause for the video

  const getIconColor = (screenName) => (currentScreen === screenName ? 'rgb(218,29,129)' : 'black');

  // List of videos
  const videos = [
    { source: require('../Assets/tadasana.mp4'), name: 'Tadasana' },
    { source: require('../Assets/catpose.mp4'), name: 'Cat Pose' },
    { source: require('../Assets/crowpose.mp4'), name: 'Crow Pose' },
    { source: require('../Assets/cowpose.mp4'), name: 'Cow Pose' },
    { source: require('../Assets/headstand.mp4'), name: 'Head Stand' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tutorial</Text>
      </View>

      {/* Content */}
      <ScrollView>
        {videos.map((video, index) => (
          <View style={styles.content} key={index}>
            <Text style={styles.videoTitle}>{video.name}</Text>
            <Video
              source={video.source}
              style={styles.video}
              controls={true} // Show video controls
              resizeMode="contain" // Adjust video aspect ratio
              paused={paused} // Manage play/pause state
              onError={(error) => console.error(`Error playing ${video.name}:`, error)} // Log any video errors
            />
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        {['Tutorial', 'Home', 'Subscription'].map((screenName) => (
          <View style={styles.iconWrapper} key={screenName}>
            <Icon
              name={screenName === 'Tutorial' ? 'videocam' : screenName === 'Home' ? 'home' : 'gift'}
              size={30}
              color={getIconColor(screenName)}
              onPress={() => setCurrentScreen(screenName)}
              accessibilityLabel={`Navigate to ${screenName}`}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerText: { fontSize: 26, fontWeight: '900', color: 'rgb(218,29,129)', letterSpacing: 3 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  video: { width: '90%', height: 200, borderRadius: 10, overflow: 'hidden' },
  videoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, backgroundColor: '#fff' },
  iconWrapper: { alignItems: 'center' },
});

export default TutorialScreen;
