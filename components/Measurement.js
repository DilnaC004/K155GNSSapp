import React, {useState, useEffect, useContext} from 'react';
import {View, Text, TextInput, Button, Switch} from 'react-native';
import Snackbar from 'react-native-snackbar';
import RNFS from 'react-native-fs';
import {etrs2jtsk} from './Calculations/transformation';
import {DataContext} from './Functions/DataContext';
import {styles} from './Styles/styles';

export default Measurement = ({nmeaParsed, rawMeasurement}) => {
  const {data, updateData} = useContext(DataContext);
  const [measurementSettings, setMeasurementSettings] = useState(
    data.measurementSettings,
  );
  const updateMeasurementSettings = newSettings => {
    setMeasurementSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [pointSettings, setPointSettings] = useState(data.pointSettings);
  const updatePointSettings = newSettings => {
    setPointSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [projectSettings, setProjectSettings] = useState(data.projectSettings);

  const [isEnabled, setIsEnabled] = useState(true);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchRtk = measurementSettings.boolRtk ? 'ulož' : 'měř RTK';
  const switchRaw = measurementSettings.boolRaw ? 'ulož' : 'měř RAW';
  const switchX = isEnabled ? 'B [°]' : 'X [m]';
  const switchY = isEnabled ? 'L [°]' : 'Y [m]';
  const switchZ = isEnabled ? 'H [m]' : 'H [m]';
  const switchCoordX = isEnabled
    ? measurementSettings.etrs.b
    : measurementSettings.jtsk.X;
  const switchCoordY = isEnabled
    ? measurementSettings.etrs.l
    : measurementSettings.jtsk.Y;
  const switchCoordZ = isEnabled
    ? measurementSettings.etrs.h
    : measurementSettings.jtsk.Hbpv;

  const updateCoordinates = () => {
    const newPoint = {
      title: measurementSettings.nazev,
      b: measurementSettings.sumCoordX / (measurementSettings.coordMeasuredTime+1),
      l: measurementSettings.sumCoordY / (measurementSettings.coordMeasuredTime+1),
      h: measurementSettings.sumCoordZ / (measurementSettings.coordMeasuredTime+1),
      accuB: measurementSettings.coordAccuX,
      accuL: measurementSettings.coordAccuY,
      accuH: measurementSettings.coordAccuZ,
      pdop: measurementSettings.coordPDOP,
      time: measurementSettings.coordMeasuredTime,
      date: new Date().toLocaleString(),
      height: pointSettings.height,
      offset: pointSettings.offset,
      code: pointSettings.code,
    };

    console.log(newPoint, measurementSettings);
    Snackbar.show({
      text: `Uložen bod ${newPoint.title}`,
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'green',
      marginBottom: 5,
    });
    // Log the received values
    if (projectSettings.projectId != null) {
      console.log(
        'Point saved into project: ' +
          data.projects[projectSettings.projectId].title,
      );
      const updatedData = data.projects.map((project, index) => {
        if (index === projectSettings.projectId) {
          const updatedPoints = [...project.points, newPoint];
          return {...project, points: updatedPoints};
        }
        return project;
      });
      updateData({projects: updatedData});
    } else {
      Alert.alert('Vyber zakázku');
    }
  };

  const handleRtkPress = () => {
    if (!measurementSettings.startTime) {
      updateMeasurementSettings({
        startTime: new Date(),
        boolRtk: !measurementSettings.boolRtk,
        endTime: null,
      });
      console.log('start ');
    } else {
      updateMeasurementSettings({
        startTime: null,
        boolRtk: !measurementSettings.boolRtk,
        endTime: new Date(),
        formattedTime: '00:00:00',
      });

      updateMeasurementSettings({
        coordAccuX: 0,
        coordAccuY: 0,
        coordAccuZ: 0,
        sumCoordX: 0,
        sumCoordY: 0,
        sumCoordZ: 0,
        nazev: measurementSettings.nazev + 1,
      });

      updateCoordinates();
    }
  };

  const handleRawPress = () => {
    if (!measurementSettings.startTime) {
      updateMeasurementSettings({
        startTime: new Date(),
        boolRaw: !measurementSettings.boolRaw,
        endTime: null,
      });
      storeRawData();
    } else {
      updateMeasurementSettings({
        startTime: null,
        boolRaw: !measurementSettings.boolRaw,
        endTime: new Date(),
        formattedTime: '00:00:00',
      });
      updateMeasurementSettings({
        nazev: measurementSettings.nazev + 1,
      });
      clearInterval(measurementSettings.intervalRawMeasurement);
    }
  };

  // Function to export points into txt
  const exportRawData = async filePath => {
    try {
      await RNFS.appendFile(filePath, rawMeasurement.toString(), 'utf8'); //rewrite to streamdata

      console.log('File saved successfully to ' + filePath);
      Snackbar.show({
        text: `Soubor uložen do \r\n${filePath}`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'green',
        marginBottom: 5,
      });
    } catch (error) {
      console.log('Error saving file: ', error);
      Snackbar.show({
        text: `Chyba \r\n${error}`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    }
  };

  const storeRawData = () => {
    const filePath =
      RNFS.DownloadDirectoryPath +
      '/raw_' +
      `${data.measurementSettings.nazev}.txt`; // work only on Android
    let storeData = [];
    if (!measurementSettings.boolRaw) {
      storeData.push(rawMeasurement);
      console.log(storeData);
      let interval = setInterval(() => {
        exportRawData(filePath);
        console.log(storeData.length);
        storeData = [];
      }, 20000);
      updateMeasurementSettings({
        intervalRawMeasurement: interval,
      });
    }
  };

  // Use useEffect to start and stop the timer
  useEffect(() => {
    console.log(measurementSettings.sumCoordX, measurementSettings.sumCoordY, measurementSettings.sumCoordZ);
    let measuredTime = 0;
    const etrs = {
      b: nmeaParsed.lat,
      l: nmeaParsed.lon,
      h: nmeaParsed.alt,
    };
    const jtsk = etrs2jtsk(nmeaParsed.lat, nmeaParsed.lon, nmeaParsed.alt);
    updateMeasurementSettings({
      etrs: etrs,
      jtsk: jtsk,
      coordPDOP: nmeaParsed.hdop,
    });

    if (measurementSettings.startTime && !measurementSettings.endTime) {
      const currentTime = new Date();
      measuredTime = Math.floor(
        (currentTime - measurementSettings.startTime) / 1000,
      );
      const hours = String(Math.floor(measuredTime / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((measuredTime % 3600) / 60)).padStart(
        2,
        '0',
      );
      const seconds = String(measuredTime % 60).padStart(2, '0');

      //Measure RTK point
      updateMeasurementSettings({
        coordMeasuredTime: measuredTime,
        sumCoordX: measurementSettings.sumCoordX + parseFloat(etrs.b),
        sumCoordY: measurementSettings.sumCoordY + parseFloat(etrs.l),
        sumCoordZ: measurementSettings.sumCoordZ + parseFloat(etrs.h),
        formattedTime: `${hours}:${minutes}:${seconds}`,
      });
    } 

    // Clean up the interval when the component unmounts
    return () => {
      updateData({measurementSettings: measurementSettings});
    };
  }, [nmeaParsed]);

  return (
    <View style={styles.mereniContainer}>
      <TextInput
        style={styles.input}
        value={measurementSettings.nazev.toString()}
        placeholder="Název bodu"
        onChangeText={value => {
          updateMeasurementSettings({nazev: value});
        }}
        keyboardType="numeric" // Set the keyboard to numeric mode
      />
      <View style={styles.buttonContainer}>
        <Button title={switchRtk} onPress={handleRtkPress} />
        <Button title={switchRaw} onPress={handleRawPress} />
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.buttonContainer}>
          <View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Systém :</Text>
              <Text style={styles.tableData}>{switchCoordinates}</Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
                style={styles.switch}
              />
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Doba měření :</Text>
              <Text style={styles.tableData}>
                {measurementSettings.formattedTime}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchY}</Text>
              <Text style={styles.tableData}>{switchCoordY}</Text>
              <Text style={styles.tableData}>
                {measurementSettings.coordAccuY}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchX}</Text>
              <Text style={styles.tableData}>{switchCoordX}</Text>
              <Text style={styles.tableData}>
                {measurementSettings.coordAccuX}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchZ}</Text>
              <Text style={styles.tableData}>{switchCoordZ}</Text>
              <Text style={styles.tableData}>
                {measurementSettings.coordAccuZ}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>PDOP :</Text>
              <Text style={styles.tableData}>
                {measurementSettings.coordPDOP}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
