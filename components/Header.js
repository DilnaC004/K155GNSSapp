import React, {useEffect, useState,useContext} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { DataContext } from './Functions/DataContext';
import {styles} from './Styles/styles';

export default Header = ({nmeaParsed, modalType, updateModalType}) => {
  const { data, updateData} = useContext(DataContext);
  const [coordStatus, setCoordStatus] = useState('black');
  const [bluetoothStatus, setBluetoothStatus] = useState('black');
  const [ntripStatus, setNtripStatus] = useState('black');

  useEffect(() => {
    switch (nmeaParsed.quality) {
      case 'fix':
        setCoordStatus('red');
        break;
      case 'float':
        setCoordStatus('orange');
        break;
      case 'dgps-fix':
        setCoordStatus('purple');
        break;
      case 'pps-fix':
        setCoordStatus('white');
        break;
      case 'rtk':
        setCoordStatus('green');
        break;
      case 'rtk-float':
        setCoordStatus('orange');
        break;
      case 'estimated':
        setCoordStatus('red');
        break;
      case 'manual':
        setCoordStatus('pink');
        break;
      case 'simulated':
        setCoordStatus('yellow');
        break;
      default:
        setCoordStatus('black');
        break;
    }
    if(data.bluetoothSettings.isEnabled){
      setBluetoothStatus("black")
    } else {
      setBluetoothStatus("aqua")
    }
    if(!data.ntripSettings.ntripConnect){
      setNtripStatus("black")
    } else {
      setNtripStatus("orange")
    }
    
  }, [nmeaParsed, data.bluetoothSettings.isEnabled ,data.ntripSettings.ntripConnect]);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => {
          if (modalType.bluetooth) {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: true,
            });
          } else {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: true,
              ntrip: false,
              project: false,
              map: false,
              measurement: false,
            });
          }
        }}>
        <Image
            source={require('./Images/bluetooth.png')}
            style={styles.icon}
          />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (modalType.ntrip) {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: true,
            });
          } else {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: true,
              project: false,
              map: false,
              measurement: false,
            });
          }
        }}>
        <Image
            source={require('./Images/server.png')}
            style={[styles.icon]}
          />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (modalType.project) {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: true,
            });
          } else {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: true,
              map: false,
              measurement: false,
            });
          }
        }}>
        <Image
            source={require('./Images/folder.png')}
            style={[styles.icon]}
          />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (modalType.point) {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: true,
            });
          } else {
            updateModalType({
              point: true,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: false,
            });
          }
        }}>
        <Image
            source={require('./Images/signal.png')}
            style={[styles.icon]}
          />
        <Text style={styles.headerInfoText}>{nmeaParsed.quality}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (modalType.placing) {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: true,
            });
          } else {
            updateModalType({
              point: false,
              placing: true,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: false,
            });
          }
        }}>
        <Image
            source={require('./Images/location_mark_pinned.png')}
            style={[styles.icon]}
          />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (modalType.map) {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: true,
            });
          } else {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: true,
              measurement: false,
            });
          }
        }}>
        <Image
            source={require('./Images/map_location_mark.png')}
            style={[styles.icon]}
          />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (modalType.skyplot) {
            updateModalType({
              point: false,
              placing: false,
              skyplot: false,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: true,
            });
          } else {
            updateModalType({
              point: false,
              placing: false,
              skyplot: true,
              bluetooth: false,
              ntrip: false,
              project: false,
              map: false,
              measurement: false,
            });
          }
        }}>
        <Image
            source={require('./Images/graph.png')}
            style={[styles.icon]}
          />
      </TouchableOpacity>
    </View>
  );
};
