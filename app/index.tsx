import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import CoordinateInput from './CoordinateInput';
import RecStations from './ClosestLocations';
import StationSelector from './StationSelector';
import StationInfo from './CheckStationInfo'

const Index = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [currentStation, setCurrentStation] = useState('San Francisco 4th & King');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to CalTrain finder!</Text>
      
      <CoordinateInput 
        lat={latitude} 
        long={longitude} 
        onLatChange={setLatitude} 
        onLongChange={setLongitude}
      />

      <RecStations 
        userLat={latitude} 
        userLong={longitude} 
      />

      <StationSelector 
        selectedStation={currentStation}
        onSelectStation={setCurrentStation}
      />

      <StationInfo
        stationName={currentStation}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 30,
        textAlign: 'center',
    },
});

export default Index;