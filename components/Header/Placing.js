import React, {useState, useEffect, useContext} from 'react';
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
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import {styles} from '../Styles/styles';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {etrs2jtsk, jtsk2etrs} from '../Calculations/transformation';
import GPS from 'gps';
import {DataContext} from '../Functions/DataContext';
import FlatListPoint from './ProjectComponents/FlatListPoint';
import CompassHeading from 'react-native-compass-heading';

export const Placing = () => {
  const {data, updateData} = useContext(DataContext);
  const [placingSettings, setPlacingSettings] = useState(data.placingSettings);
  const updatePlacingSettings = newSettings => {
    setPlacingSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  useEffect(() => {
    updatePlacingSettings({
      points: data.projects[data.projectSettings.projectId].points,
      dist: 0,
      selectedPoint: 0,
      heading: 0,
      heightDelta: 0,
    });
  }, []);

  const gps = new GPS();
  var NMEA = null;
  const points = data.projects[data.projectSettings.projectId].points;
  var compassHeading = 0;
  var compassAccuracy = 0 ;
  var positionJtsk;
  var placingJtsk;

  useEffect(() => {
    const degree_update_rate = 3;

    CompassHeading.start(degree_update_rate, ({compassHeading, compassAccuracy}) => {
      console.log('CompassHeading: ', compassHeading, compassAccuracy);
    });
  }, []);


  // Add an event listener on all protocols
  gps.on('data', parsed => {
    NMEA = parsed; // Ulozeni NMEA zpravy
  });

  // Call the update routine directly with a NMEA sentence, which would
  // come from the serial port or stream-reader normally
  gps.update(
    '$GPGGA,224900.000,5032.3762,N,01503.5393,E,1,04,7.8,123.1,M,48.0,M,,0000*5E',
  );

  const calculate = (gps) => {
    var point = placingSettings.points[placingSettings.selectedPoint]
    positionJtsk = etrs2jtsk(gps.state.lat, gps.state.lon, gps.state.alt)
    placingJtsk = etrs2jtsk(point.b, point.l, point.h)

    updatePlacingSettings({
      dist: GPS.Distance(gps.state.lat, gps.state.lon, point.b, point.l) * 1000,
      heading: GPS.Heading(gps.state.lat, gps.state.lon, point.b, point.l),
      heightDelta: (point.h - gps.state.alt),
      deltaY: placingJtsk.Y - positionJtsk.Y,
      deltaX: placingJtsk.X - positionJtsk.X,
    });   
  };
  
  const click = (index) => {
    console.log('Calling from Placing')
    updatePlacingSettings({selectedPoint: index});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vytyčení</Text>
      <Text style={styles.text}>Zvol bod z aktivní zakazky:</Text>
      <FlatListPoint
        projectSettings={data.projectSettings}
        updateProjectSettings={click}
        placing = {true}

      />
      <Button
        title="Vytyčuj"
        onPress={() => {
          calculate(gps);
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Vzdálenost: {placingSettings.dist.toFixed(3)} m</Text>
        <Text style={styles.title}>Prevýšení: {placingSettings.heightDelta.toFixed(3)} m</Text>
        <Text style={styles.title}>Směr: {placingSettings.heading.toFixed(0)}˚</Text>
        <Text style={styles.title}>delta Y: {placingSettings.deltaY.toFixed(3)} m</Text>
        <Text style={styles.title}>delta X: {placingSettings.deltaX.toFixed(3)} m</Text>
        <View style={styles.compassWrapper}>
          <Image
            source={require('./arrow.png')}
            style={[styles.arrow, {transform: [{rotate: (placingSettings.heading - compassHeading) + 'deg'}]}]}
          />
        </View>
      </View>
    </View>
  );
};
export default Placing;
