import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const LocalUpdatesBanner = () => {
  return (
    <LinearGradient
      colors={['#0000FF', '#00FFFF']} // Blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <Text style={styles.text}>Local Updates</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: width - 40, // Full width with some padding
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  text: {
    color: 'green', // Changed text color to white for better contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LocalUpdatesBanner;