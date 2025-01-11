import React, { useEffect, useRef, useState } from 'react';
import { View, Button, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';

const Calculate = ({ }) => {
  const [shownCalculation, setShownCalculation] = useState(0);
  // 1 - trigonometrie, 2 - uzaver, 3 - nivelace

  const closeAll = () => {
    setShownCalculation(0);
  };

  useEffect(() => {
    Snackbar.show({
      text: "Funkce je ve vyvoji.",
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
  }, []);

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Ověřovací výpočty do terénu</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Výška trigonometrie"
          onPress={() => {
            if (shownCalculation == 0) {
              setShownCalculation(1);
            } else {
              closeAll();
            };
          }}
        />
        <Button
          title="Uzávěr trojúhelníku"
          onPress={() => {
            if (shownCalculation == 0) {
              setShownCalculation(2);
            } else {
              closeAll();
            };
          }}
        />
      </View>
      {(shownCalculation == 1) && (
          // Create trig component
        )}
      {(shownCalculation == 2) && (
          // Create triangle component
        )}
        <View style={styles.buttonContainer}>
          <Button
            title="Kontrola nivelace"
            onPress={() => {
              if (shownCalculation == 0) {
                setShownCalculation(3);
              } else {
                closeAll();
              };
            }}
          />
        </View>
        {(shownCalculation == 3) && (
          // Create leveling component
        )}
    </View>
  );
};

export default Calculate;
