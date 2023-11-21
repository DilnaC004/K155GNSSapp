// Jak ulozit do prozatimni promenne po kliknuti

// Zkontrolovat project ID, pokud neni zadny, vyber zakazku
// Pokud neni null, zobraz body ze zakazky do console.log
// Zobrazit v rolovacim menu pro vyber k vytyceni   --- POVEDLO SE
// Po zakliknuti se spocte uhel a delka -- POVEDLO SE, napsat obecne
// Zobrazit uhel a delku k bodu  -- POVEDLO SE
// Ukazat smerovku  -- POVEDLO SE

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

export const Placing = () => {
  const {data, updateData} = useContext(DataContext);
  const [placingSettings, setPlacingSettings] = useState(data.projectPlacing);
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
    });
  }, []);

  const gps = new GPS();
  var NMEA = null;
  const [dist, setDist] = useState(0);
  const [heading, setHeading] = useState(0);
  const [heightDelta, setHeightDelta] = useState(0);
  const [points, setPoints] = useState(
    data.projects[data.projectSettings.projectId].points,
  );
  const [point, setPoint] = useState(points[0]);

  // Add an event listener on all protocols
  gps.on('data', parsed => {
    NMEA = parsed; // Ulozeni NMEA zpravy
  });

  // Call the update routine directly with a NMEA sentence, which would
  // come from the serial port or stream-reader normally
  gps.update(
    '$GPGGA,224900.000,5032.3762,N,01503.5393,E,1,04,7.8,123.1,M,48.0,M,,0000*5E',
  );

  const calculate = (dist, heading, gps) => {
    setDist(
      (
        GPS.Distance(gps.state.lat, gps.state.lon, point.b, point.l) * 1000
      ).toFixed(3),
    ); // metry
    setHeightDelta((point.h - gps.state.alt).toFixed(3));
    setHeading(
      GPS.Heading(gps.state.lat, gps.state.lon, point.b, point.l).toFixed(5),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vytyčení</Text>
      <Text style={styles.text}>Zvol bod z aktivní zakazky:</Text>
      <FlatListPoint
        projectSettings={data.projectSettings}
        updateProjectSettings={updatePlacingSettings}
      />
      <Button
        title="Vytyčuj"
        onPress={() => {
          calculate(dist, heading, gps);
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Vzdálenost: {dist} m</Text>
        <Text style={styles.title}>Prevýšení: {heightDelta} m</Text>
        <Text style={styles.title}>Směr: {heading}˚</Text>
        <View style={styles.compassWrapper}>
          <Image
            source={require('./arrow.png')}
            style={[styles.arrow, {transform: [{rotate: heading + 'deg'}]}]}
          />
        </View>
      </View>
    </View>
  );
};
export default Placing;
