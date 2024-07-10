import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const VoiceButton = ({ onPress }: { onPress: () => void }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <LinearGradient
          colors={['#FF0000', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Ionicons name="mic" size={24} color="black" />
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    button: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  export default VoiceButton;