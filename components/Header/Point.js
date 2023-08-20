import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, PermissionsAndroid, Platform } from 'react-native';

import { styles } from '../Styles/styles';

export const Point = ({heightAntena, setHeightAntena, offsetAntena, setOffsetAntena, codePoint, setCodePoint}) => {
  return (
    <SafeAreaView>
      <Text style={styles.title}>Nastavení antény:</Text>
      <Text >K155GNSS KRABIČKA - fázové centrum 42 mm</Text>
      <Text >K155GNSS VÁLEC - fázové centrum XX mm</Text>
      <View style={styles.hrLine} />
      <Text style={styles.title}>Fázové centrum [m]</Text>
      <TextInput
          style={styles.input}
          value={offsetAntena.toString()}
          placeholder="Fázové centrum [m]"
          onChangeText={setOffsetAntena}
          maxLength={5} // Set the maximum number of characters allowed
          keyboardType="numeric" // Set the keyboard to numeric mode
        />
        <Text style={styles.title}>Výška antény [m]</Text>
      <TextInput
        style={styles.input}
        value={heightAntena.toString()}
        onChangeText={setHeightAntena}
        placeholder="Výška antény [m]"
        maxLength={5} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <Text style={styles.title}>Kód</Text>
      <TextInput
        style={styles.input}
        value={codePoint.toString()}
        onChangeText={setCodePoint}
        placeholder="Kód"
      />
    </SafeAreaView>
  );
};

export default Point;
