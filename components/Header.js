import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DataContext } from './Functions/DataContext';
import { styles } from './Styles/styles';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SoundPlayer from 'react-native-sound-player';

export default Header = ({ connectedState, ntripConnectedState, lastGGA, modalType, updateModalType, nmeaParsed }) => {
  const { data, updateData } = useContext(DataContext);
  const [coordStatus, setCoordStatus] = useState('black');
  const [connectionStatus, setConnectionStatus] = useState('black');
  const [ntripStatus, setNtripStatus] = useState('black');
  const prevLastGGA = useRef(lastGGA);

  useEffect(() => {
    if (lastGGA) {
      switch (lastGGA.quality) {
        case 'fix':
          if (lastGGA.quality !== prevLastGGA.current.quality) {
            console.log("Playing fix sound");
            SoundPlayer.playAsset(require("./Sounds/fix.mp3"));
          }
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
          if (lastGGA.quality !== prevLastGGA.current.quality) {
            console.log("Playing rtk fix sound");
            SoundPlayer.playAsset(require("./Sounds/rtk_fix.mp3"));
          }
          setCoordStatus('green');
          break;
        case 'rtk-float':
          if (lastGGA.quality !== prevLastGGA.current.quality) {
            console.log("Playing rtk float sound");
            SoundPlayer.playAsset(require("./Sounds/rtk_float.mp3"));
          }
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
    } else {
      setCoordStatus('black');
    }
    if (connectedState) {
      setConnectionStatus("green")
    } else {
      setConnectionStatus("black")
    }
    if (!ntripConnectedState) {
      setNtripStatus("black")
    } else {
      setNtripStatus("green")
    }

    prevLastGGA.current = lastGGA;
    
    //console.log(`Header.js: useEffect() ${connectedState}`);
  }, [lastGGA, connectedState, ntripConnectedState]);

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
        <Icon
          name='wifi'
          size={30}
          color={connectionStatus}
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
        <Icon
          name='server'
          size={30}
          color={ntripStatus}
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
        <Icon
          name='folder-open'
          size={30}
          color={'black'}
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
        <Icon
          name='satellite-dish'
          size={30}
          color={coordStatus}
        />
        <Text style={styles.headerInfoText}>{(lastGGA != '') ? lastGGA.quality : ""}</Text>
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
        <Icon
          name='flag'
          size={30}
          color={'black'}
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
        <Icon
          name='map'
          size={30}
          color={'black'}
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
        <Icon
          name='satellite'
          size={30}
          color={'black'}
        />
        {/* May show incorrect sat count */}
        <Text style={styles.headerInfoText}>{(lastGGA != '' && connectedState) ? `${nmeaParsed.satsActive?.length ?? 0} / ${nmeaParsed.satsVisible?.length ?? 0}` : "" }</Text>
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
        <Icon
          name='book'
          size={30}
          color={'black'}
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
        <Icon
          name='calculator'
          size={30}
          color={'black'}
        />
      </TouchableOpacity>
    </View>
  );
};
