import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, PermissionsAndroid, Platform } from 'react-native';


export const Point = () => {
  const [fazCentr, setfazCetntr] = React.useState('');
  const [kodPoint, setkodPoint] = React.useState('');
  const [vyskaAnteny, setVyskaAnteny] = React.useState('');

  const handleFazCentrChange = (value) => {
    setFazCentr(value);
  };

  const handlekodPointChange = (value) => {
    setkodPoint(value);
  };

  const handleVyskaAntenyChange = (value) => {
    setVyskaAnteny(value);
  };


  return (
    <SafeAreaView>
      <Text style={styles.title}>Nastavení antény:</Text>
      <Text >K155GNSS KRABIČKA - fázové centrum 42 mm</Text>
      <Text >K155GNSS VÁLEC - fázové centrum XX mm</Text>
      <View style={styles.hrLine} />
      <TextInput
          style={styles.input}
          value={fazCentr}
          placeholder="Fázové centrum [m]"
          onChangeText={handleFazCentrChange}
          maxLength={5} // Set the maximum number of characters allowed
          keyboardType="numeric" // Set the keyboard to numeric mode
        />
      <TextInput
        style={styles.input}
        value={vyskaAnteny}
        onChangeText={handleVyskaAntenyChange}
        placeholder="Výška antény [m]"
        maxLength={5} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
            <TextInput
        style={styles.input}
        value={vyskaAnteny}
        onChangeText={handlekodPointChange}
        placeholder="Kód"

      />

    </SafeAreaView>
  );
};

export default Point;

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
    padding: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hrLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
};