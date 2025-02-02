import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, ScrollView, Button } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import TaskInfo from './TaskInfo';

const Learn = ({ }) => {
  const [shownTask, setShownTask] = useState(1);

  const closeAll = () => {
    setShownTask(0);
  };

  return (
    <View style={styles.nastContainer}>
      <Text style={styles.headline}>Zadání úloh předmětu 155VGP</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="0. Pokyny"
          onPress={() => {
            if (shownTask != 1) {
              setShownTask(1);
            } else {
              closeAll();
            };
          }}
        />
        <Button
          title="1. TRG"
          onPress={() => {
            if (shownTask != 2) {
              setShownTask(2);
            } else {
              closeAll();
            };
          }}
        />
        <Button
        title="2. SOUC"
        onPress={() => {
          if (shownTask != 3) {
            setShownTask(3);
          } else {
            closeAll();
          };
        }}
      />
      <Button
        title="3. VPN"
        onPress={() => {
          if (shownTask != 4) {
            setShownTask(4);
          } else {
            closeAll();
          };
        }}
      />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="4. VED"
          onPress={() => {
            if (shownTask != 5) {
              setShownTask(5);
            } else {
              closeAll();
            };
          }}
        />
        <Button
          title="5. LAS"
          onPress={() => {
            if (shownTask != 6) {
              setShownTask(6);
            } else {
              closeAll();
            };
          }}
        />
        <Button
          title="6. FAS"
          onPress={() => {
            if (shownTask != 7) {
              setShownTask(7);
            } else {
              closeAll();
            };
          }}
        />
        <Button
          title="7. GNSS"
          onPress={() => {
            if (shownTask != 8) {
              setShownTask(8);
            } else {
              closeAll();
            };
          }}
        />
      </View>
      {(shownTask != 0) && (<TaskInfo taskNumber={shownTask} />)}
    </View>
  );
};

export default Learn;
