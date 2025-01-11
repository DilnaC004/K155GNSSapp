import React, { useState, useContext } from 'react';
import { TextInput, View, Text, Switch, Button } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../../Styles/styles';

export default Trigonometry = ({ }) => {
  // state inputs
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const toggleSwitch = () => setSwitchEnabled(previousState => !previousState);
  const switchDistances = switchEnabled ? 'Vodorovná vzdálenost' : 'Šikmá vzdálenost';

  const trigTemplate = {
    zenith: "",
    distance: "",
    height: "",
  }

  const [trigData, setTrigData] = useState(trigTemplate)
  const updateTrigData = newData => {
    setTrigData(prevData => ({
      ...prevData,
      ...newData,
    }));
  };

  // check the fields before running the calculation
  const checkBeforeCalculating = () => {
    if (trigData.distance == "" || trigData.distance < 0) {
      Snackbar.show({
        text: 'Vlož platnou délku',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else if (trigData.zenith == "" || trigData.zenith < 0 || trigData.zenith > 400) {
      Snackbar.show({
        text: 'Zadej zenitový úhel ve správném rozsahu',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else {
      calculate();
    }
  }

  const calculate = () => { }

  const clearFields = () => {
    updateTrigData({
      zenith: "",
      distance: "",
      height: "",
    });
  }

  return (
    <View>
      <TextInput
        style={styles.textInput}
        placeholder="Zenitový úhel"
        keyboardType="numeric"
        value={trigData.zenith}
        onChangeText={(value) => {
          updateTrigData({ zenith: value });
        }}
      />
      <View style={styles.buttonContainer}>
        <Text>Přepínač typu délky: {switchDistances}</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={switchEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={switchEnabled}
          style={styles.switch}
        />
      </View>
      <TextInput
        style={styles.textInput}
        placeholder={switchDistances}
        keyboardType="numeric"
        value={trigData.distance}
        onChangeText={(value) => {
          updateTrigData({ distance: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder={"Výsledek"}
        editable={false}
        value={trigData.height}
        onChangeText={(value) => {
          updateTrigData({ distance: value });
        }}
      />
      <Button title="Proveď výpočet" onPress={checkBeforeCalculating} />
      <Button title="Vymaž vše" onPress={clearFields} />
      <View style={styles.hrLine} />
    </View>
  );
};