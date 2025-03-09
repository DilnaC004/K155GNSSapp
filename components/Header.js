import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DataContext } from './Functions/DataContext';
import { styles } from './Styles/styles';
import GPS from 'gps';


export default Header = ({ nmeaParsed, lastGGA, modalType, updateModalType }) => {
  const { data, updateData } = useContext(DataContext);
  const [coordStatus, setCoordStatus] = useState('black');
  const [connectionStatus, setConnectionStatus] = useState('black');
  const [ntripStatus, setNtripStatus] = useState('black');

  useEffect(() => {
    if(!lastGGA) {
      setCoordStatus('black');
      return;
    }
    switch (lastGGA.quality) {
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
    if (!data.connectionSettings.isConnected) {
      setConnectionStatus("black")
    } else {
      setConnectionStatus("orange")
    }
    if (!data.ntripSettings.ntripConnect) {
      setNtripStatus("black")
    } else {
      setNtripStatus("orange")
    }

  }, [lastGGA, data.connectionSettings.isConnected, data.ntripSettings.ntripConnect]);

  const closeAll = () => {
    updateModalType({
      point: false,
      placing: false,
      skyplot: false,
      communication: false,
      ntrip: false,
      project: false,
      map: false,
      learn: false,
      calculate: false,
      measurement: true,
    });
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => {
          closeAll();
          if (!modalType.communication) {
            updateModalType({
              communication: true,
              measurement: false,
            });
          }
        }}>
        <Image
          source={require('./Images/communication.png')}
          style={[styles.icon,
            { borderColor: connectionStatus }
            ]}
        />

      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          closeAll();
          if (!modalType.ntrip) {
            updateModalType({
              ntrip: true,
              measurement: false,
            });
          }
        }}>
        <Image
          source={require('./Images/server.png')}
          style={[styles.icon,
          { borderColor: ntripStatus }
          ]}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          closeAll();
          if (!modalType.project) {
            updateModalType({
              project: true,
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
          closeAll();
          if (!modalType.point) {
            updateModalType({
              point: true,
              measurement: false,
            });
          }
        }}>
        <Image
          source={require('./Images/signal.png')}
          style={[styles.icon,
          { borderColor: coordStatus }
          ]}
        />
        <Text style={styles.headerInfoText}>{(lastGGA != null) ? lastGGA.quality : ""}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          closeAll();
          if (!modalType.placing) {
            updateModalType({
              placing: true,
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
          closeAll();
          if (!modalType.map) {
            updateModalType({
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
          closeAll();
          if (!modalType.skyplot) {
            updateModalType({
              skyplot: true,
              measurement: false,
            });
          }
        }}>
        <Image
          source={require('./Images/graph.png')}
          style={[styles.icon]}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          closeAll();
          if (!modalType.learn) {
            updateModalType({
              learn: true,
              measurement: false,
            });
          }
        }}>
        <Image
          source={require('./Images/book.png')}
          style={[styles.icon]}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          closeAll();
          if (!modalType.calculate) {
            updateModalType({
              calculate: true,
              measurement: false,
            });
          }
        }}>
        <Image
          source={require('./Images/calculate.png')}
          style={[styles.icon]}
        />
      </TouchableOpacity>
    </View>
  );
};
