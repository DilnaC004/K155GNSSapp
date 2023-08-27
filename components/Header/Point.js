import React from 'react';
import {View, Text, TextInput} from 'react-native';
import RowWithLabelAndValue from './RowWithLabelAndValue';
import {styles} from '../Styles/styles';

export default Point = ({pointSettings, updatePointSettings}) => {
  return (
    <View>
      <Text style={styles.title}>Fázové centrum [m]</Text>
      <TextInput
        style={styles.input}
        value={pointSettings.offset.toString()}
        placeholder="Fázové centrum [m]"
        onChangeText={value => {
          updatePointSettings({offset: value});
        }}
        maxLength={5} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <Text style={styles.title}>Výška antény [m]</Text>
      <TextInput
        style={styles.input}
        value={pointSettings.height.toString()}
        onChangeText={value => {
          updatePointSettings({height: value});
        }}
        placeholder="Výška antény [m]"
        maxLength={5} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <Text style={styles.title}>Kód</Text>
      <TextInput
        style={styles.input}
        value={pointSettings.code.toString()}
        onChangeText={value => {
          updatePointSettings({code: value});
        }}
        placeholder="Kód"
      />
      <RowWithLabelAndValue label="K155GNSS KRABIČKA" value="42mm" />
      <RowWithLabelAndValue label="K155GNSS VÁLEC" value="XXmm" />
    </View>
  );
};
