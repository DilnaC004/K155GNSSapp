import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {styles} from './Styles/styles';

export default Header = ({nmeaParsed, modalType, updateModalType}) => {
  const [coordStatus, setCoordStatus] = React.useState('black');

  useEffect(() => {
    if (nmeaParsed.quality == 'fix') {
      setCoordStatus('green');
    }
    if (nmeaParsed.quality == 'float') {
      setCoordStatus('orange');
    }
    if (nmeaParsed.quality == 'dgps-fix') {
      setCoordStatus('purple');
    }
    if (nmeaParsed.quality == 'pps-fix') {
      setCoordStatus('white');
    }
    if (nmeaParsed.quality == 'rtk') {
      setCoordStatus('blue');
    }
    if (nmeaParsed.quality == 'rtk-float') {
      setCoordStatus('orange');
    }
    if (nmeaParsed.quality == 'estimated') {
      setCoordStatus('red');
    }
    if (nmeaParsed.quality == 'manual') {
      setCoordStatus('pink');
    }
    if (nmeaParsed.quality == 'simulated') {
      setCoordStatus('yellow');
    }
  }, [nmeaParsed]);

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
        <Icon name="bluetooth" size={32} color="black" />
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
        <IconFontAwesome5 name="server" size={32} color="black" />
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
