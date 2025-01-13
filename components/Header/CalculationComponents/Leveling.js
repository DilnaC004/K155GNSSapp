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
    if (levelingData.alpha == "" || levelingData.beta == "" || levelingData.gamma == "") {
      Snackbar.show({
        text: 'Zadej všechny úhly',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else if (levelingData.alpha < 0 || levelingData.beta < 0 || levelingData.gamma < 0) {
      Snackbar.show({
        text: 'Zadej platné úhly',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else {
      calculate();
    }
  }

  const calculate = () => {
    const [deviation, permitedDeviation, isWithin] = fieldCalculations.leveling(parseFloat(levelingData.heightDiffForward), parseFloat(levelingData.heightDiffBack), parseFloat(levelingData.coefficientK), parseFloat(levelingData.distance));
    updateLevelingData({ deviation: deviation.toFixed(0), permitedDeviation: permitedDeviation.toFixed(0), isWithinPermited: isWithin? "Ano" : "Ne" });
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