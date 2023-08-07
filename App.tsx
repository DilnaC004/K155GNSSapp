import React, {useState, useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, StyleSheet, useColorScheme, View,} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import GPS from 'gps';

import Header from './components/Header';
import Mereni from './components/Mereni';

function App(): JSX.Element {
  const gps = new GPS;

  const [coordStatus, setCoordStatus] = React.useState('black');
  const [nmeaParsed, setNmeaParsed] = useState('');

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

   // Use useEffect to start and stop the timer
 useEffect(() => {
  // Add an event listener on all protocols
  gps.on('data', parsed => {
    setNmeaParsed(parsed);
    if(parsed.quality == 'fix'){
      setCoordStatus("green");
    }
    if(parsed.quality == 'float'){
      setCoordStatus("orange");
    }
  });

  // Call the update routine directly with a NMEA sentence, which would
  // come from the serial port or stream-reader normally
  gps.update(
    '$GPGGA,224900.000,4832.3762,N,00903.5393,E,1,04,7.8,498.6,M,48.0,M,,0000*5E',
  );

}, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <Header nmeaParsed={nmeaParsed} setNmeaParsed={setNmeaParsed} coordStatus={coordStatus}></Header>
      <Mereni nmeaParsed={nmeaParsed}></Mereni>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
