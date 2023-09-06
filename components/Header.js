import React, {useEffect, useState,useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
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
      setBluetoothStatus("blue")
    }
    if(!data.ntripSettings.ntripConnect){
      setNtripStatus("black")
    } else {
      setNtripStatus("blue")
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
        <Icon name="bluetooth" size={32} color={bluetoothStatus} />
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
        <IconFontAwesome5 name="server" size={32} color={ntripStatus} />
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
        <Icon name="folder" size={32} color="black" />
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
        <Icon name="dot-circle-o" size={32} color={coordStatus} />
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
        <Icon name="flag" size={32} color="black" />
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
        <Icon name="map" size={32} color="black" />
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
        <IconFontAwesome5 name="satellite" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
};
