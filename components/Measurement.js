import React, {useState, useEffect, useContext} from 'react';
import {View, Text, TextInput, Button, Switch} from 'react-native';
import Snackbar from 'react-native-snackbar';
import RNFS from 'react-native-fs';
import {etrs2jtsk} from './Calculations/transformation';
import {DataContext} from './Functions/DataContext';
import {styles} from './Styles/styles';

export default Measurement = ({nmeaParsed, rawMeasurement, connectedState, lastGST}) => {
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

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchRtk = measurementSettings.boolRtk ? 'ulož' : 'měř RTK';
  const switchRaw = measurementSettings.boolRaw ? 'ulož' : 'měř RAW';
  const switchX = isEnabled ? 'B [°]' : 'X [m]';
  const switchY = isEnabled ? 'L [°]' : 'Y [m]';
  const switchZ = isEnabled ? 'H [m]' : 'H [m]';
  // Only for display, we can fix decimals here
  const switchCoordX = isEnabled
    ? measurementSettings.etrs.b.toFixed(9)
    : measurementSettings.jtsk.X.toFixed(3);
  const switchCoordY = isEnabled
    ? measurementSettings.etrs.l.toFixed(9)
    : measurementSettings.jtsk.Y.toFixed(3);
  const switchCoordZ = isEnabled
    ? measurementSettings.etrs.h.toFixed(9)
    : measurementSettings.jtsk.Hbpv.toFixed(3);

  const updateCoordinates = () => {
    var newPointB = measurementSettings.sumCoordB / (measurementSettings.coordMeasuredTime + 1);
    var newPointL = measurementSettings.sumCoordL / (measurementSettings.coordMeasuredTime + 1);
    var newPointH = measurementSettings.sumCoordH / (measurementSettings.coordMeasuredTime + 1);
    var i = 0;

    while (Math.abs(newPointB - measurementSettings.etrs.b) > 0.5) {
      // A dividing error happened, recalculating
      newPointB = measurementSettings.sumCoordB / (measurementSettings.coordMeasuredTime - i);
      newPointL = measurementSettings.sumCoordL / (measurementSettings.coordMeasuredTime - i);
      newPointH = measurementSettings.sumCoordH / (measurementSettings.coordMeasuredTime - i);

      i++;
      if (i > measurementSettings.coordMeasuredTime) {
        Snackbar.show({
          text: 'Příliš krátká doba měření!',
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
        return false;
      }
    }
    
    const newPointJTSK = etrs2jtsk(newPointB, newPointL, newPointH);

    const newPoint = {
      title: measurementSettings.nazev,
      b: newPointB,
      l: newPointL,
      h: newPointH,
      x: newPointJTSK.X,
      y: newPointJTSK.Y,
      z: newPointJTSK.Hbpv,
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
          const updatedPointCount = project.pointCount + 1;
          return {...project, points: updatedPoints, pointCount: updatedPointCount};
        }
        return project;
      });
      updateData({projects: updatedData});
    } else {
      Alert.alert('Vyber zakázku');
    }
  };

  const handleRtkPress = () => {
    if (!connectedState) {
      Snackbar.show({
        text: 'Před měřením se připoj k přijímači!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      return;
    }
    if (!measurementSettings.startTime) {
      updateMeasurementSettings({
        startTime: new Date(),
        boolRtk: !measurementSettings.boolRtk,
        endTime: null,
      });
      console.log('start');
    } else {
      updateMeasurementSettings({
        startTime: null,
        boolRtk: !measurementSettings.boolRtk,
        endTime: new Date(),
        formattedTime: '00:00:00',
      });

      if (updateCoordinates() == false) {
        updateMeasurementSettings({
          coordAccuX: 0,
          coordAccuY: 0,
          coordAccuZ: 0,
          sumCoordB: 0,
          sumCoordL: 0,
          sumCoordH: 0,
        });
        return;
      };

      // Update after saving the point
      updateMeasurementSettings({
        coordAccuX: 0,
        coordAccuY: 0,
        coordAccuZ: 0,
        sumCoordB: 0,
        sumCoordL: 0,
        sumCoordH: 0,
        nazev: Number(measurementSettings.nazev) + 1,
      });
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
        coordAccuX: 0,
        coordAccuY: 0,
        coordAccuZ: 0,
        sumCoordB: 0,
        sumCoordL: 0,
        sumCoordH: 0,
        nazev: measurementSettings.nazev + 1,
      });
      clearInterval(measurementSettings.intervalRawMeasurement);
    }
  };

  const storeRawData = () => {
    const filePath =
      RNFS.DownloadDirectoryPath + '/raw_' + `${data.measurementSettings.nazev}.txt`; // Works only on Android
  
    let storeData = [];
  
    // Check if raw measurement storage is enabled
    if (!measurementSettings.boolRaw) {
      storeData.push(rawMeasurement);
  
      // Save data to the file every 20 seconds
      const interval = setInterval(() => {
        if (storeData.length > 0) {
          const dataToWrite = storeData.join('\n') + '\n';
          RNFS.appendFile(filePath, dataToWrite, 'utf8')
            .then(() => {
              console.log('Data written to file:', filePath);
            })
            .catch(err => {
              console.log('Error writing to file:', err.message);
            });
  
          // Clear the storeData array after writing to file
          storeData = [];
        }
      }, 20000);
  
      // Save the interval reference to stop it later if needed
      updateMeasurementSettings({
        intervalRawMeasurement: interval,
      });
    }
  };

  // Use useEffect to start and stop the timer
  useEffect(() => {
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
      coordPDOP: nmeaParsed.pdop,
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
      
      // Save the worst precision
      if (lastGST.latitudeError > measurementSettings.coordAccuY) {
        updateMeasurementSettings({coordAccuY: lastGST.latitudeError});
      }
      if (lastGST.longitudeError > measurementSettings.coordAccuX) {
        updateMeasurementSettings({coordAccuX: lastGST.longitudeError});
      }
      if (lastGST.heightError > measurementSettings.coordAccuZ) {
        updateMeasurementSettings({coordAccuZ: lastGST.heightError});
      }

      //Measure RTK point
      updateMeasurementSettings({
        coordMeasuredTime: measuredTime,
        sumCoordB: measurementSettings.sumCoordB + parseFloat(etrs.b),
        sumCoordL: measurementSettings.sumCoordL + parseFloat(etrs.l),
        sumCoordH: measurementSettings.sumCoordH + parseFloat(etrs.h),
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
      <Text style={styles.headline}>Měření</Text>
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
                {measurementSettings.coordAccuY == 0? lastGST.latitudeError : measurementSettings.coordAccuY}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchX}</Text>
              <Text style={styles.tableData}>{switchCoordX}</Text>
              <Text style={styles.tableData}>
              {measurementSettings.coordAccuX == 0? lastGST.longitudeError : measurementSettings.coordAccuX}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>{switchZ}</Text>
              <Text style={styles.tableData}>{switchCoordZ}</Text>
              <Text style={styles.tableData}>
              {measurementSettings.coordAccuZ == 0? lastGST.heightError : measurementSettings.coordAccuZ}
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
