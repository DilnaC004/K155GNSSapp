import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, Text, TextInput, Button, Switch, Alert} from 'react-native';
import Snackbar from 'react-native-snackbar';
import {etrs2jtsk} from './Calculations/transformation';
import {DataContext} from './Functions/DataContext';
import {styles} from './Styles/styles';
import SoundPlayer from 'react-native-sound-player';
import useServerApi, {serverErrorText} from './hooks/useServerApi';
import {formatBytes, formatDuration, locationText} from './Functions/serverFormat';

// How often the server is asked whether the static recording is still growing
const STATIC_POLL_MS = 3000;

// Bumps the trailing number of a point name, keeping any prefix and padding:
// '1' -> '2', 'B09' -> 'B10', 'Bod' stays as it is
const nextPointName = name => {
  const match = name?.toString().match(/^(.*?)(\d+)$/);
  if (!match) {
    return name;
  }
  const [, prefix, digits] = match;
  return prefix + String(Number(digits) + 1).padStart(digits.length, '0');
};

export default Measurement = ({nmeaParsed, rawMeasurement, connectedState, lastGST, lastGGA, connectionSettings}) => {
  const {data, updateData} = useContext(DataContext);
  const api = useServerApi(connectionSettings);
  const [staticState, setStaticState] = useState({recording: false});
  const [writingTo, setWritingTo] = useState(null);
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
  // This screen is mounted before the stored data is loaded, so it must not
  // write its starting values back over what came out of the storage
  const pointSettingsEdited = useRef(false);
  const updatePointSettings = newSettings => {
    pointSettingsEdited.current = true;
    setPointSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [projectSettings, setProjectSettings] = useState(data.projectSettings);

  // Follow the shared data until the user edits the antenna height or the code
  useEffect(() => {
    if (!pointSettingsEdited.current) {
      setPointSettings(data.pointSettings);
    }
  }, [data.pointSettings]);

  // The antenna height and code are edited here, keep them in the shared data
  useEffect(() => {
    return () => {
      if (pointSettingsEdited.current) {
        updateData({
          pointSettings: pointSettings,
        });
      }
    };
  }, [pointSettings]);

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchRtk = measurementSettings.boolRtk ? 'ulož' : 'měř RTK';
  // The static recording state comes from the server, not from local state
  const switchRaw = staticState.recording ? 'ulož RAW' : 'měř RAW';
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
      hdop: measurementSettings.coordHDOP,
      time: measurementSettings.coordMeasuredTime,
      date: new Date().toLocaleString(),
      height: pointSettings.height,
      offset: pointSettings.offset,
      code: pointSettings.code,
      fix: measurementSettings.fix,
    };

    console.log(newPoint, measurementSettings);

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
      
      // Give feedback
      SoundPlayer.playAsset(require('././Sounds/point_saved.mp3'));
      Snackbar.show({
        text: `Uložen bod ${newPoint.title}`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'green',
        marginBottom: 5,
      });
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
    if (!checkNameAvailability(measurementSettings.nazev)) {
      // Give feedback
      SoundPlayer.playAsset(require('././Sounds/error.mp3'));
      Snackbar.show({
        text: 'Zadej nepoužité číslo bodu!',
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
      // Give feedback
      SoundPlayer.playAsset(require('././Sounds/measurement_start.mp3'));
      Snackbar.show({
        text: 'Začínám měřit.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'green',
        marginBottom: 5,
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
          fix: '',
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
        nazev: nextPointName(measurementSettings.nazev),
        fix: '',
      });
    }
  };

  // Static measurement is recorded by the server, not by the phone. It runs
  // independently of the RTK averaging above and survives a disconnect.
  const refreshStaticStatus = async () => {
    try {
      const status = await api.staticStatus();
      setStaticState(status);
      return status;
    } catch (error) {
      console.log('Static status failed:', serverErrorText(error));
      return null;
    }
  };

  const refreshStorage = async () => {
    try {
      const storage = await api.storageStatus();
      setWritingTo(storage.writing_to);
    } catch (error) {
      console.log('Storage status failed:', serverErrorText(error));
    }
  };

  const handleRawPress = async () => {
    if (!api.hasServer) {
      Snackbar.show({
        text: 'Adresa serveru není známa, počkej na připojení.',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      return;
    }

    if (staticState.recording) {
      try {
        const stopped = await api.staticStop();
        setStaticState({recording: false});
        refreshStorage();
        updateMeasurementSettings({nazev: nextPointName(measurementSettings.nazev)});
        SoundPlayer.playAsset(require('././Sounds/point_saved.mp3'));
        Snackbar.show({
          text: `Statické měření uloženo: ${stopped.raw_file} (${formatDuration(stopped.duration_s)}, ${formatBytes(stopped.bytes_written)})`,
          duration: Snackbar.LENGTH_LONG,
          textColor: 'green',
          marginBottom: 5,
        });
      } catch (error) {
        // The server may have stopped on its own, resync either way
        refreshStaticStatus();
        SoundPlayer.playAsset(require('././Sounds/error.mp3'));
        Snackbar.show({
          text: serverErrorText(error),
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'red',
          marginBottom: 5,
        });
      }
      return;
    }

    const pointId = measurementSettings.nazev?.toString().trim();
    if (!pointId) {
      SoundPlayer.playAsset(require('././Sounds/error.mp3'));
      Snackbar.show({
        text: 'Zadej název bodu!',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      return;
    }

    try {
      const started = await api.staticStart(pointId);
      setStaticState(started);
      SoundPlayer.playAsset(require('././Sounds/measurement_start.mp3'));
      Snackbar.show({
        text: `Statické měření běží, soubor ${started.raw_file} na ${locationText(started.location ?? writingTo)}.`,
        duration: Snackbar.LENGTH_LONG,
        textColor: 'green',
        marginBottom: 5,
      });
    } catch (error) {
      // A recording started before the app reconnected shows up as 409
      refreshStaticStatus();
      SoundPlayer.playAsset(require('././Sounds/error.mp3'));
      Snackbar.show({
        text: serverErrorText(error),
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    }
  };

  // Pick up a recording that kept running while the app was away
  useEffect(() => {
    if (connectedState && api.hasServer) {
      refreshStaticStatus();
      refreshStorage();
    } else {
      setStaticState({recording: false});
      setWritingTo(null);
    }
  }, [connectedState, api.baseUrl]);

  // bytes_written climbing is the only proof data is really arriving
  useEffect(() => {
    if (!staticState.recording || !api.hasServer) {
      return;
    }
    const pollId = setInterval(refreshStaticStatus, STATIC_POLL_MS);
    return () => clearInterval(pollId);
  }, [staticState.recording, api.baseUrl]);
  const fixPriority = {
    rtk: 1,
    'rtk-float': 2,
    'dgps-fix': 3,
    fix: 4,
    float: 5,
    estimated: 6,
    manual: 7,
    simulated: 8,
    default: 9,
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
      coordHDOP: nmeaParsed.hdop,
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

      // Save the worst fix quality
      if (lastGGA) {
        // Update worstFix based on priority
        if (
          measurementSettings.fix == '' || // If no worstFix is set yet
          (fixPriority[lastGGA.quality] || fixPriority.default) > (fixPriority[measurementSettings.fix] || fixPriority.default)
        ) {
          updateMeasurementSettings({fix: lastGGA.quality});
        }
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

  const checkNameAvailability = (name) => {
    if (projectSettings.projectId != null) {
      const project = data.projects[projectSettings.projectId];
      const existingPoints = [...project.points];

      if (existingPoints.some(point => point.title === name)) {
        return false;
      }

      return name;
    }
    // Give feedback
    SoundPlayer.playAsset(require('././Sounds/error.mp3'));
    Snackbar.show({
      text: 'Není zvolena zakázka!',
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'red',
      marginBottom: 5,
    });
    return false;
  };

  return (
    <View style={styles.mereniContainer}>
      <Text style={styles.headline}>Měření</Text>
      {(!connectedState) && (
        <View>
          <Text style={styles.headline}>Připoj přijímač, abys mohl měřit.</Text>
        </View>
      )}
      {(nmeaParsed.fix == null && connectedState) && (
        <View>
          <Text style={styles.headline}>Čekám na fixaci...</Text>
        </View>
      )}
      {(nmeaParsed.fix != null && connectedState) && (
        <View>
          <Text style={styles.title}>Číslo bodu</Text>
          <TextInput
            style={styles.input}
            value={measurementSettings.nazev.toString()}
            placeholder="Název bodu"
            onChangeText={value => {
              updateMeasurementSettings({nazev: value});
            }}
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <Text style={styles.title}>Výška antény [m]</Text>
          <TextInput
            style={styles.input}
            value={pointSettings.height.toString()}
            onChangeText={value => {
              updatePointSettings({height: value});
            }}
            placeholder="Výška antény [m]"
            maxLength={5} // Set the maximum number of characters allowed
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <Text style={styles.title}>Kód</Text>
          <TextInput
            style={styles.input}
            value={pointSettings.code.toString()}
            onChangeText={value => {
              updatePointSettings({code: value});
            }}
            placeholder="Kód"
          />
          <View style={styles.buttonContainer}>
            <Button title={switchRtk} onPress={handleRtkPress} />
            <Button title={switchRaw} onPress={handleRawPress} />
          </View>
          {staticState.recording ? (
            <View style={styles.tableContainer}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Statické měření :</Text>
                <Text style={styles.tableData}>běží</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Soubor :</Text>
                <Text style={styles.tableData}>{staticState.raw_file}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Uloženo na :</Text>
                <Text style={styles.tableData}>
                  {locationText(staticState.location ?? writingTo)}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Doba statiky :</Text>
                <Text style={styles.tableData}>
                  {formatDuration((Date.now() - staticState.start_ns / 1e6) / 1000)}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Zapsáno :</Text>
                <Text style={styles.tableData}>
                  {formatBytes(staticState.bytes_written)}
                </Text>
              </View>
              {staticState.last_error != null && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Chyba :</Text>
                  <Text style={styles.tableData}>{staticState.last_error}</Text>
                </View>
              )}
            </View>
          ) : (
            writingTo != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Statika se uloží na :</Text>
                <Text style={styles.tableData}>{locationText(writingTo)}</Text>
              </View>
            )
          )}
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
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>HDOP :</Text>
                  <Text style={styles.tableData}>
                    {measurementSettings.coordHDOP}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
