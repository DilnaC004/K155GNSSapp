import React, { useState } from 'react';
import { TextInput, View, Text, Switch, Button } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../../Styles/styles';
import fieldCalculations from '../../Calculations/fieldCalculations';

export default Triangle = ({ }) => {
  // state inputs
  const triangleTemplate = {
    alpha: "",
    beta: "",
    gamma: "",
    permitedMisclosure: "",
    angularMisclosure: "",
    isWithinPermited: "",
  }

  const [triangleData, setTriangleData] = useState(triangleTemplate)
  const updateTriangleData = newData => {
    setTriangleData(prevData => ({
      ...prevData,
      ...newData,
    }));
  };

  // check the fields before running the calculation
  const checkBeforeCalculating = () => {
    if (triangleData.alpha == "" || triangleData.beta == "" || triangleData.gamma == "") {
      Snackbar.show({
        text: 'Zadej všechny úhly',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else if (triangleData.alpha < 0 || triangleData.beta < 0 || triangleData.gamma < 0) {
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
    triangleData.alpha = replaceComma(triangleData.alpha);
    triangleData.beta = replaceComma(triangleData.beta);
    triangleData.gamma = replaceComma(triangleData.gamma);
    triangleData.permitedMisclosure = replaceComma(triangleData.permitedMisclosure);
    
    const [calculatedMisclosure, isWithin] = fieldCalculations.triangle(parseFloat(triangleData.alpha), parseFloat(triangleData.beta), parseFloat(triangleData.gamma), parseFloat(triangleData.permitedMisclosure));
    updateTriangleData({ angularMisclosure: calculatedMisclosure.toFixed(0), isWithinPermited: isWithin? "Ano" : "Ne" });
  }

  
  const replaceComma = (value) => {
    return value.replace(",", ".");
  }

  const clearFields = () => {
    updateTriangleData({
      alpha: "",
      beta: "",
      gamma: "",
      permitedMisclosure: "",
      angularMisclosure: "",
      isWithinPermited: "",
    });
  }

  return (
    <View>
      <TextInput
        style={styles.textInput}
        placeholder="1. úhel [gon]"
        keyboardType="numeric"
        value={triangleData.alpha}
        onChangeText={(value) => {
          updateTriangleData({ alpha: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="2. úhel [gon]"
        keyboardType="numeric"
        value={triangleData.beta}
        onChangeText={(value) => {
          updateTriangleData({ beta: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="3. úhel [gon]"
        keyboardType="numeric"
        value={triangleData.gamma}
        onChangeText={(value) => {
          updateTriangleData({ gamma: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Mezní uzávěr [cc]"
        keyboardType="numeric"
        value={triangleData.permitedMisclosure}
        onChangeText={(value) => {
          updateTriangleData({ permitedMisclosure: value });
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Uzávěr [cc]"
        editable={false}
        value={triangleData.angularMisclosure}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Dodržen uzávěr?"
        editable={false}
        value={triangleData.isWithinPermited}
      />
      <Button title="Proveď výpočet" onPress={checkBeforeCalculating} />
      <Button title="Vymaž vše" onPress={clearFields} />
      <View style={styles.hrLine} />
    </View>
  );
};