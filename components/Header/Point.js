import React, {useState, useEffect ,useContext} from 'react';
import {View, Text, TextInput} from 'react-native';
import RowWithLabelAndValue from './RowWithLabelAndValue';
import { DataContext } from '../Functions/DataContext';
import {styles} from '../Styles/styles';

export default Point = () => {

  const { data, updateData} = useContext(DataContext);

  const [pointSettings, setPointSettings] = useState(data.pointSettings);

  const updatePointSettings = newSettings => {
    setPointSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  useEffect(() => {
    return () => {
      updateData({
        pointSettings:pointSettings,
      })
    };
  }, [pointSettings]);

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Nastavení přijímače</Text>
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
