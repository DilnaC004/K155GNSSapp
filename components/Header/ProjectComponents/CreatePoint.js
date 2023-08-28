import React, {useState} from 'react';
import {TextInput, View, Text, Switch, Button} from 'react-native';

import {styles} from '../../Styles/styles';

export default CreatePoint = ({
  pointSettings,
  updatePointSetting,
  projectSettings,
  data,
  updateData,
}) => {
  // state point inputs
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchX = isEnabled ? 'L [DMS]' : 'X [m]';
  const switchY = isEnabled ? 'B [DMS]' : 'Y [m]';
  const switchZ = isEnabled ? 'H [DMS]' : 'H [m]';

  // add point into list of points and async storage
  const addPoint = () => {
    if (isEnabled) {
      updatePointSetting({
        accuB: 0,
        accuL: 0,
        accuH: 0,
        pdop: 0,
        time: 0,
        code: 'input',
        date: new Date().toLocaleString(),
      });
    } else {
      const etrs = jtsk2etrs(y, x, z);
      updatePointSetting({
        b: etrs.B,
        l: etrs.L,
        h: etrs.H,
        accuB: 0,
        accuL: 0,
        accuH: 0,
        pdop: 0,
        time: 0,
        code: 'input',
        date: new Date().toLocaleString(),
      });
    }

    const updatedData = data.projects.map((project, index) => {
      if (index === projectSettings.projectId) {
        const updatedPoints = [...project.points, pointSettings];
        return {...project, points: updatedPoints};
      }
      return project;
    });

    updateData({projects: updatedData});
    console.log(
      'Add point ' +
        pointSettings.title +
        ' to project ' +
        data.projects[projectSettings.projectId].title,
    );
  };

  return (
    <View>
      <View style={styles.buttonContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Název bodu"
          value={pointSettings.title}
          onChangeText={value => {
            updatePointSetting({title: value});
          }}
        />
        <Text>{switchCoordinates}</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          style={styles.switch}
        />
      </View>
      <TextInput
        style={styles.textInput}
        placeholder={switchY}
        value={pointSettings.l.toString()}
        onChangeText={value => {
          updatePointSetting({l: value});
        }}
        maxLength={11} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <TextInput
        style={styles.textInput}
        placeholder={switchX}
        value={pointSettings.b.toString()}
        onChangeText={value => {
          updatePointSetting({b: value});
        }}
        maxLength={11} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <TextInput
        style={styles.textInput}
        placeholder={switchZ}
        value={pointSettings.h.toString()}
        onChangeText={value => {
          updatePointSetting({h: value});
        }}
        maxLength={7} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <Button title="Ulož bod" onPress={addPoint} />
      <View style={styles.hrLine}/>
    </View>
  );
};
