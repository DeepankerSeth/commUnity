import React from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

interface DonateProps {
  navigation: any;
}

const Donate: React.FC<DonateProps> = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} onPress={() => navigation.navigate('Home')}>commUnity</Text>
        <View style={styles.nav}>
          <Text style={styles.navItem} onPress={() => navigation.navigate('Monitor')}>Monitor</Text>
          <Text style={styles.navItem} onPress={() => navigation.navigate('Predictions')}>Predictions</Text>
          <Text style={styles.navItem} onPress={() => navigation.navigate('Evacuation')}>Evacuation</Text>
        </View>
      </View>
      <View style={styles.main}>
        <View style={styles.section}>
          <Text style={styles.title}>Find the Right Charity for You</Text>
          <Text style={styles.description}>
            Tell us your interests, location, and donation amount, and we will recommend the best charities for your needs.
          </Text>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Interests</Text>
              {/* Replace with a Picker or custom component */}
              <TextInput style={styles.input} placeholder="Select interests" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput style={styles.input} placeholder="Enter your location" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Donation Amount</Text>
              <TextInput style={styles.input} placeholder="Enter amount" keyboardType="numeric" />
            </View>
            <Button title="Get Recommendations" onPress={() => {}} />
          </View>
        </View>
        <View style={styles.section}>
          <Image
            source={{ uri: 'https://via.placeholder.com/550' }}
            style={styles.image}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>Current Global Crises</Text>
          <Text style={styles.description}>
            These are some of the most pressing global issues right now. Consider donating to help make a difference.
          </Text>
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ukraine Humanitarian Crisis</Text>
              <Text style={styles.cardDescription}>
                Provide aid and support to those affected by the ongoing conflict in Ukraine.
              </Text>
              <View style={styles.cardFooter}>
                <Button title="Donate Now" onPress={() => {}} />
                <Text style={styles.cardRaised}>$1.2M raised</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Famine in East Africa</Text>
              <Text style={styles.cardDescription}>
                Help provide food, water, and medical aid to those affected by the severe drought in East Africa.
              </Text>
              <View style={styles.cardFooter}>
                <Button title="Donate Now" onPress={() => {}} />
                <Text style={styles.cardRaised}>$850K raised</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Earthquake in Turkey and Syria</Text>
              <Text style={styles.cardDescription}>
                Support rescue and recovery efforts for the devastating earthquake that struck Turkey and Syria.
              </Text>
              <View style={styles.cardFooter}>
                <Button title="Donate Now" onPress={() => {}} />
                <Text style={styles.cardRaised}>$1.5M raised</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Text>Footer Content</Text>
      </View>
    </ScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Donate">
        <Stack.Screen name="Donate" component={Donate} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nav: {
    flexDirection: 'row',
    gap: 16,
  },
  navItem: {
    fontSize: 14,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  main: {
    flex: 1,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardRaised: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
});

export default App;