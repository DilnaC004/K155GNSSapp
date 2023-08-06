import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

import NmeaViewer from './NmeaViewer';

// Sample NMEA messages, replace with your actual GPS data
const nmeaMessages = [
  "$GPRMC,045658.000,A,3740.3000,N,12225.2900,W,0.0,90.0,150423,,,A*6B",
  "$GPGGA,045658.000,3740.3000,N,12225.2900,W,1,04,1.5,70.2,M,-24.5,M,,*5A",
  "$GPGSA,A,3,09,12,19,24,27,30,09,19,12,27,30,01,2.5,1.5,1.0*30",
  "$GPGSV,3,1,09,01,58,167,19,03,46,314,29,04,30,159,20,06,48,296,25*7A",
  "$GPGSV,3,2,09,09,27,271,26,12,60,121,23,19,60,290,32,24,15,194,17*74",
  "$GPGSV,3,3,09,27,29,065,26,30,25,308,31*7E",
  "$GPGLL,3740.3000,N,12225.2900,W,045658.000,A,A*47",
  "$GPVTG,90.0,T,,M,0.0,N,0.0,K,A*3F",
  "$GPZDA,045658.000,15,04,2023,00,00*6F",
  "$GPGST,045658.000,1.5,1.5,2.0,1.0,2.0,1.0,1.5*52",
  "$GPBOD,045658.000,T,90.0,M,90.0,N,*47",
];


export const Bluetooth = () => {

  const [devices, setDevices] = useState([]);

  const bleManager = new BleManager({
    scanForPeripherals: true,
    onDeviceFound: (device) => {
      setDevices((devices) => [...devices, device]);
    },
    onScanFailed: (error) => {
      console.log(error);
    }
  });



  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentNmea, setCurrentNmea] = useState('');

  useEffect(() => {
    // Set an interval to update the currentNmea every second
    const intervalId = setInterval(() => {
      setCurrentNmea(nmeaMessages[currentIndex]);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % nmeaMessages.length);
    }, 1000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [currentIndex]);

  return (
    <SafeAreaView>
      <Text style={styles.title}>Nastavení Bluetooth připojení:</Text>
      <Button
        title="Scan for Bluetooth devices"
        onPress={() => {
        }}
      />
      <Button title="Stop" onPress={() => {
        }} />
      <NmeaViewer nmeaMessages={nmeaMessages} />
    </SafeAreaView>
  );
};

export default Bluetooth;

const styles = {
  nastContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hrLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  refreshButton: {
    marginRight: 8,
    padding: 8,
  },
};