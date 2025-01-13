import React, { useEffect, useRef, useState } from 'react';
import { View, Button, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import Trigonometry from './CalculationComponents/Trigonometry';
import Triangle from './CalculationComponents/Triangle';
import Leveling from './CalculationComponents/Leveling';

const Calculate = ({ }) => {
  const [shownCalculation, setShownCalculation] = useState(0);
  // 1 - trigonometrie, 2 - uzaver, 3 - nivelace

  const closeAll = () => {
    setShownCalculation(0);
  };

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Ověřovací výpočty do terénu</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Výška trigonometrie"
          onPress={() => {
            if (shownCalculation != 1) {
              setShownCalculation(1);
            } else {
              closeAll();
            };
          }}
        />
        <Button
          title="Uzávěr trojúhelníku"
          onPress={() => {
            if (shownCalculation != 2) {
              setShownCalculation(2);
            } else {
              closeAll();
            };
          }}
        />
      </View>
      {(shownCalculation == 1) && ( <Trigonometry/> )}
      {(shownCalculation == 2) && ( <Triangle/> )}
        <View style={styles.buttonContainer}>
          <Button
            title="Kontrola nivelace"
            onPress={() => {
              if (shownCalculation != 3) {
                setShownCalculation(3);
              } else {
                closeAll();
              };
            }}
          />
        </View>
        {(shownCalculation == 3) && ( <Leveling/> )}
    </View>
  );
};

export default Calculate;
