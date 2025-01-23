import React, { useState } from 'react';
import { TextInput, View, Text, Switch, Button } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../../Styles/styles';
import fieldCalculations from '../../Calculations/fieldCalculations';

export default Leveling = ({ }) => {
  // state inputs
  const levelingTemplate = {
    heightDiffForward: "",
    heightDiffBack: "",
    coefficientK: "",
    distance: "",
    deviation: "",
    permitedDeviation: "",
    isWithinPermited: "",
  }

  const [levelingData, setLevelingData] = useState(levelingTemplate)
  const updateLevelingData = newData => {
    setLevelingData(prevData => ({
      ...prevData,
      ...newData,
    }));
  };

  // check the fields before running the calculation
  const checkBeforeCalculating = () => {
    if (levelingData.heightDiffForward == "" || levelingData.heightDiffBack == "" || levelingData.distance == "") {
      Snackbar.show({
        text: 'Zadej nutné hodnoty',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else if ((levelingData.heightDiffForward < 0 && levelingData.heightDiffForward > 0) || (levelingData.heightDiffForward > 0 && levelingData.heightDiffForward < 0)) {
      Snackbar.show({
        text: 'Převýšení tam a zpět mají opačné znaménko',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else {
      calculate();
    }
  }

  const calculate = () => {
    levelingData.heightDiffForward = replaceComma(levelingData.heightDiffForward);
    levelingData.heightDiffBack = replaceComma(levelingData.heightDiffBack);
    levelingData.coefficientK = replaceComma(levelingData.coefficientK);
    levelingData.distance = replaceComma(levelingData.distance);

    const [deviation, permitedDeviation, isWithin] = fieldCalculations.leveling(parseFloat(levelingData.heightDiffForward), parseFloat(levelingData.heightDiffBack), parseFloat(levelingData.coefficientK), parseFloat(levelingData.distance));
    updateLevelingData({ deviation: deviation.toFixed(0), permitedDeviation: permitedDeviation.toFixed(0), isWithinPermited: isWithin? "Ano" : "Ne" });
  }

  const replaceComma = (value) => {
    return value.replace(",", ".");
  }

  const clearFields = () => {
    updateLevelingData({
      heightDiffForward: "",
      heightDiffBack: "",
      coefficientK: "",
      distance: "",
      deviation: "",
      permitedDeviation: "",
      isWithinPermited: "",
    });
  }

  return (
    <View>
      <TextInput
        style={styles.textInput}
        placeholder="Převýšení tam [m]"
        keyboardType="numeric"
        value={levelingData.heightDiffForward}
        onChangeText={(value) => {
          updateLevelingData({ heightDiffForward: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Převýšení zpět [m]"
        keyboardType="numeric"
        value={levelingData.heightDiffBack}
        onChangeText={(value) => {
          updateLevelingData({ heightDiffBack: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Koeficient k (implicitně 40)"
        keyboardType="numeric"
        value={levelingData.coefficientK}
        onChangeText={(value) => {
          updateLevelingData({ coefficientK: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Délka jedné cesty [km]"
        keyboardType="numeric"
        value={levelingData.distance}
        onChangeText={(value) => {
          updateLevelingData({ distance: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Rozdíl tam a zpět [mm]"
        editable={false}
        value={levelingData.deviation}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Mezní odchylka [mm]"
        editable={false}
        value={levelingData.permitedDeviation}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Dodržena podmínka?"
        editable={false}
        value={levelingData.isWithinPermited}
      />
      <Button title="Proveď výpočet" onPress={checkBeforeCalculating} />
      <Button title="Vymaž vše" onPress={clearFields} />
      <View style={styles.hrLine} />
    </View>
  );
};