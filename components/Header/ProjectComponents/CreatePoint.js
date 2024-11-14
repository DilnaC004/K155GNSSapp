import React, {useState, useContext} from 'react';
import {TextInput, View, Text, Switch, Button} from 'react-native';
import Snackbar from 'react-native-snackbar';
import { DataContext } from '../../Functions/DataContext';
import {styles} from '../../Styles/styles';
import { jtsk2etrs, etrs2jtsk } from '../../Calculations/transformation';

export default CreatePoint = ({
  pointSettings,
  updatePointSetting,
  projectSettings,
}) => {
  const { data, updateData } = useContext(DataContext);
  // state point inputs
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchX = isEnabled ? 'L [DMS]' : 'X [m]';
  const switchY = isEnabled ? 'B [DMS]' : 'Y [m]';
  const switchZ = isEnabled ? 'H [DMS]' : 'H [m]';

  // add point into list of points and async storage
  const addPoint = () => {
    const currentProjectId = projectSettings.projectId;
    if(pointSettings.title == ''){
      Snackbar.show({
        text: 'Vlož název bodu',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else if (data.projects[currentProjectId].points.some(point => point.title === pointSettings.title)) {
      Snackbar.show({
        text: 'Zvol nepoužitý název bodu',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else if ((pointSettings.b === "0" && pointSettings.y === "0") || (pointSettings.l === "0" && pointSettings.x === "0") || (pointSettings.h === "0" || pointSettings.z === "0")) {
      console.group(pointSettings)
      Snackbar.show({
        text: 'Vlož souřadnice bodu',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } else {
      savePoint();
      resetPointSettings();
  }
}

  const savePoint = () => {
    if (isEnabled) {
      const jtsk = etrs2jtsk(pointSettings.b, pointSettings.l, pointSettings.h);
      updatePointSetting({
        x: jtsk.X,
        y: jtsk.Y,
        z: jtsk.Hbpv,
        accuB: 0,
        accuL: 0,
        accuH: 0,
        pdop: 0,
        time: 0,
        code: 'input',
        date: new Date().toLocaleString(),
      });
    } else {
      const etrs = jtsk2etrs(pointSettings.x, pointSettings.y, pointSettings.z);
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
        const updatedPointCount = project.pointCount + 1;
        return {...project, points: updatedPoints, pointCount: updatedPointCount};
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

  const resetPointSettings = () => {
    updatePointSetting({
      title: (Number(pointSettings.title)+1).toString(),
      x: '',
      y: '',
      z: '',
      b: '',
      l: '',
      h: '',
      accuB: 0,
      accuL: 0,
      accuH: 0,
      pdop: 0,
      time: 0,
      date: 0,
      height: 0,
      offset: 0,
      code: '',
    });
  }

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
        value={isEnabled? pointSettings.b : pointSettings.y}
        onChangeText={(value) => {
          updatePointSetting(isEnabled ? { b: value } : { y: value });
        }}
        maxLength={11} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <TextInput
        style={styles.textInput}
        placeholder={switchX}
        value={isEnabled? pointSettings.l : pointSettings.x}
        onChangeText={value => {
          updatePointSetting(isEnabled ? { l: value } : { x: value });
        }}
        maxLength={11} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <TextInput
        style={styles.textInput}
        placeholder={switchZ}
        value={isEnabled? pointSettings.h : pointSettings.z}
        onChangeText={value => {
          updatePointSetting(isEnabled ? { h: value } : { z: value });
        }}
        maxLength={7} // Set the maximum number of characters allowed
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <Button title="Ulož bod" onPress={addPoint} />
      <View style={styles.hrLine}/>
    </View>
  );
};
