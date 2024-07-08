import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Use ImagePicker for both images and videos
import { Ionicons } from '@expo/vector-icons'; // Import the icon library
import { supabase } from './supabaseClient';

export default function App() {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<null | { uri: string }>(null);
  const [video, setVideo] = useState<null | { uri: string }>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('description', description);
    if (photo) {
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      formData.append('photo', blob, 'photo.jpg');
    }
    if (video) {
      const response = await fetch(video.uri);
      const blob = await response.blob();
      formData.append('video', blob, 'video.mp4');
    }

    const res = await fetch('http://your-backend-url/api/report', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      Alert.alert('Incident reported successfully!');
    } else {
      Alert.alert('Failed to report incident');
    }
  };

  const handleVoiceInput = () => {
    Alert.alert('Voice input button pressed');
    // Implement your voice input functionality here
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text>Report an Incident</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Describe the incident"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput}>
            <Ionicons name="mic" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Button title="Upload image" onPress={pickImage} />
        {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}
        <Button title="Upload video" onPress={pickVideo} />
        {video && <Text>{video.uri}</Text>}
        <Button title="Upload any other files" onPress={pickVideo} />
        {video && <Text>{video.uri}</Text>}
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
  },
  voiceButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
});