import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface CoordinateInputProps {
  lat: string;
  long: string;
  onLatChange: (text: string) => void;
  onLongChange: (text: string) => void;
}

const CoordinateInput = ({ lat, long, onLatChange, onLongChange }: CoordinateInputProps) => {

  return (
    <View>
       <TextInput
         style={styles.input}
         onChangeText={onLatChange}
         value={lat}
         placeholder="latitude"
         keyboardType="numeric"
       />
       <TextInput
         style={styles.input}
         onChangeText={onLongChange}
         value={long}
         placeholder="longitude"
         keyboardType="numeric"
       />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
    backgroundColor: 'white'
  },
});

export default CoordinateInput;