import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Calistoga_400Regular } from '@expo-google-fonts/calistoga';
import * as SplashScreen from 'expo-splash-screen';
import VoiceButton from '../../components/VoiceIcon';
import SearchBar from '../../components/SearchBar';
import LocalUpdatesBanner from '../../components/LocalUpdatesBanner';

SplashScreen.preventAutoHideAsync();

export default function Homepage() {

  const handleVoicePress = () => {
    // Add your voice functionality here
    console.log('Voice button pressed');
  };

  const handleSearch = (query: string) => {
    // Implement your search logic here
    console.log('Searching for:', query);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>commUnity</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <SafeAreaView style={styles.searchVoiceContainer}>
            <SearchBar onSearch={handleSearch} />
            <VoiceButton onPress={handleVoicePress} />
          </SafeAreaView>
        </View>
      </View>
      <LocalUpdatesBanner />
      <View style={styles.linkContainer}>
        <TouchableOpacity style={styles.link} onPress={() => {}}>
          <Text style={styles.linkText}>Monitor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => {}}>
          <Text style={styles.linkText}>Predictions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => {}}>
          <Text style={styles.linkText}>Evacuation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 15,
    paddingTop: 30, // Increased padding to lower the logo
    paddingBottom: 10, // Increased padding to lower the logo
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#fff', // Optional: Add background color to header
    zIndex: 1, // Ensure the header is above other elements
  },
  logo: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: 'black',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 100, // Add padding to avoid overlap with header
  },
  content: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  searchVoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  donateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  link: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  linkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});