import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  TextInput,
  Alert,
  Switch,
  Animated
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import { etrs2jtsk, jtsk2etrs } from '../Calculations/transformation';
import GPS from 'gps';
import { DataContext } from '../Functions/DataContext';
import FlatListPoint from './ProjectComponents/FlatListPoint';
import CompassHeading from 'react-native-compass-heading';

export const Placing = ({ nmeaParsed }) => {
  const { data, updateData } = useContext(DataContext);
  const [placingSettings, setPlacingSettings] = useState(data.placingSettings);
  const updatePlacingSettings = newSettings => {
    setPlacingSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Compass
  const [heading, setHeading] = useState(0);
  useEffect(() => {
    const degreeUpdateRate = 2;
    CompassHeading.start(degreeUpdateRate, ({ heading, accuracy }) => {
      console.log("CompassHeading: ", heading, accuracy);
      setHeading(heading);
    });
    return () => {
      CompassHeading.stop();
    };
  }, []);

  useEffect(() => {
    updatePlacingSettings({
      points: data.projects[data.projectSettings.projectId].points,
    });
  }, []);

  const points = data.projects[data.projectSettings.projectId].points;
  var positionJtsk;
  var placingJtsk;

  useEffect(() => {
    if (placingSettings.points && nmeaParsed) {
      calculate(nmeaParsed);
    }
  }, [placingSettings.selectedPoint, nmeaParsed]);

  const calculate = (nmeaParsed) => {
    var point = placingSettings.points[placingSettings.selectedPoint]
    positionJtsk = etrs2jtsk(nmeaParsed.lat, nmeaParsed.lon, nmeaParsed.alt)
    placingJtsk = {
      X: point.x,
      Y: point.y,
      Z: point.z
    };
    var deltaY = placingJtsk.Y - positionJtsk.Y;
    var deltaX = placingJtsk.X - positionJtsk.X;

    updatePlacingSettings({
      dist: Math.sqrt(Math.pow(deltaY, 2) + Math.pow(deltaX, 2)),   // GPS.Distance(nmeaParsed.lat, nmeaParsed.lon, point.b, point.l) * 1000,
      heading: GPS.Heading(nmeaParsed.lat, nmeaParsed.lon, point.b, point.l),
      heightDelta: (point.z - positionJtsk.Hbpv),
      deltaY: deltaY,
      deltaX: deltaX,
    });
  };

  const click = (index) => {
    updatePlacingSettings({ selectedPoint: index });
  };

  return (
    <View style={styles.placingContainer}>
      <Text style={styles.title}>Vytyčení</Text>
      <Text style={styles.text}>Zvol bod z aktivní zakazky:</Text>
      <FlatListPoint
        projectSettings={data.projectSettings}
        updatePlacingSettings={click}
        placing={true}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Vzdálenost: {placingSettings.dist.toFixed(3)} m</Text>
        <Text style={styles.title}>Prevýšení: {placingSettings.heightDelta.toFixed(3)} m</Text>
        <Text style={styles.title}>Směr: {placingSettings.heading.toFixed(0)}˚</Text>
        <Text style={styles.title}>delta Y: {placingSettings.deltaY.toFixed(3)} m</Text>
        <Text style={styles.title}>delta X: {placingSettings.deltaX.toFixed(3)} m</Text>
        <View style={styles.compassWrapper}>
          <Image
            source={require('../Images/arrow.png')}
            style={[styles.arrow, { transform: [{ rotate: (placingSettings.heading == null ? 0 : placingSettings.heading - heading) + 'deg' }] }]}
          />
        </View>
      </View>
    </View>
  );
};
export default Placing;