// Jak ulozit do prozatimni promenne po kliknuti

// Zkontrolovat project ID, pokud neni zadny, vyber zakazku
// Pokud neni null, zobraz body ze zakazky do console.log
// Zobrazit v rolovacim menu pro vyber k vytyceni   --- POVEDLO SE
// Po zakliknuti se spocte uhel a delka
// Zobrazit uhel a delku k bodu
// Ukazat smerovku

import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
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


// Funkce pro nacteni dat zakazky
const ItemPoint = ({item, onPress, backgroundColor, textColor, textColor1}) => (
  <ScrollView
    horizontal
    contentContainerStyle={styles.scrollViewContent}
    showsHorizontalScrollIndicator={false}>
    <Text style={[styles.title, {color: textColor1}]}>{item.title} </Text>
    <Text style={[styles.title, {color: textColor1}]}>B </Text>
    <Text style={[styles.title, {color: textColor}]}>{item.b} </Text>
    <Text style={[styles.title, {color: textColor1}]}>L </Text>
    <Text style={[styles.title, {color: textColor}]}>{item.l} </Text>
    <Text style={[styles.title, {color: textColor1}]}>H </Text>
    <Text style={[styles.title, {color: textColor}]}>{item.h} </Text>
  </ScrollView>
);

export const Placing = () => {
  const {data, updateData} = useContext(DataContext);
  const gps = new GPS();
  var NMEA = null;
  const [dist, setDist] = useState(0);
  var heading;
  const [points, setPoints] = useState(
    data.projects[data.projectSettings.projectId].points,
  );
  const [point, setPoint] = useState(points[0]);

  // console.log(data.projects[0].title);

  // Add an event listener on all protocols
  gps.on('data', parsed => {
    NMEA = parsed; // Ulozeni NMEA zpravy
  });

  // Call the update routine directly with a NMEA sentence, which would
  // come from the serial port or stream-reader normally
  gps.update(
    '$GPGGA,224900.000,5032.3762,N,01403.5393,E,1,04,7.8,498.6,M,48.0,M,,0000*5E',
  );

  // Kopie ukladani souradnic bodu z importu
  const savePoint = () => {
    var newPoint = null;
    const x = parseFloat(ItemPoint.item.b);
    const y = parseFloat(ItemPoint.item.l);
    const z = parseFloat(ItemPoint.item.h);
    console.log(data.projects[data.projectSettings.projectId].points);
  };

  const calculate = (dist, heading, gps) => {
    setDist(GPS.Distance(gps.lat, gps.lon, point.b, point.l) / 1000);
    heading = GPS.Heading(gps.lat, gps.lon, point.b, point.l);
    console.log(gps);
    console.log(dist);
    console.log(heading);
  };

  const renderItemPoint = ({item}) => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={setPoint(item)}>
          <ItemPoint item={item} textColor={'gray'} textColor1={'white'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vytyčení</Text>
      <Text style={styles.text}>Zvol bod z aktivni zakazky:</Text>
      <FlatList
        data={points}
        renderItem={renderItemPoint}
        keyExtractor={item => item.title}
      />
      <Button title="Vytyčuj" onPress={() => {calculate(dist, heading, gps, points)}} />
      <View style={styles.buttonContainer}>
        <Text style={styles.title}>Vzdalenost: {dist}</Text>
      </View>
    </View>
  );
};
export default Placing;
