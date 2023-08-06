import React from 'react';
import { View, Text, Image, TouchableOpacity, Button, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import Bluetooth from './Header/Bluetooth'
import Ntrip from './Header/Ntrip'
import Project from './Header/Project'
import Skyplot from './Header/Skyplot';
import Point from './Header/Point';
import Map from './Header/Map';

const Header = () => {
  const [isBLEModalVisible, setBLEModalVisible] = React.useState(false);
  const [isPointModalVisible, setPointModalVisible] = React.useState(false);
  const [isSkyplotModalVisible, setSkyplotModalVisible] = React.useState(false);
  const [isNtripModalVisible, setNtripModalVisible] = React.useState(false);
  const [isProjModalVisible, setProjModalVisible] = React.useState(false);
  const [isMapModalVisible, setMapModalVisible] = React.useState(false);

  const toggleBLEModal = () => {
    setBLEModalVisible(!isBLEModalVisible);
  };
  const togglePointModal = () => {
    setPointModalVisible(!isPointModalVisible);
  };
  const toggleSkyplotModal = () => {
    setSkyplotModalVisible(!isSkyplotModalVisible);
  };
  const toggleNtripModal = () => {
    setNtripModalVisible(!isNtripModalVisible);
  };
  const toggleProjModal = () => {
    setProjModalVisible(!isProjModalVisible);
  };
  const toggleMapModal = () => {
    setMapModalVisible(!isMapModalVisible);
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={togglePointModal} >
        <Icon name="dot-circle-o" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleSkyplotModal} >
        <IconFontAwesome5 name="satellite" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleBLEModal} >
        <Icon name="bluetooth" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleNtripModal} >
        <IconFontAwesome5  name="server" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleProjModal} >
        <Icon name="folder" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleMapModal} >
        <Icon name="map" size={32} color="black" />
      </TouchableOpacity>
      
      <Modal visible={isBLEModalVisible} animationType="slide">
        <Bluetooth />
        <TouchableOpacity style={styles.closeButton} onPress={toggleBLEModal}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>

      <Modal visible={isPointModalVisible} animationType="slide">
        <Point></Point>
        <TouchableOpacity style={styles.closeButton} onPress={togglePointModal}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>

      <Modal visible={isSkyplotModalVisible} animationType="slide">
        <Skyplot></Skyplot>
        <TouchableOpacity style={styles.closeButton} onPress={toggleSkyplotModal}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>

      <Modal visible={isNtripModalVisible} animationType="slide">
        <Ntrip />
        <TouchableOpacity style={styles.closeButton} onPress={toggleNtripModal}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>

      <Modal visible={isProjModalVisible} animationType="slide">
        <Project />
        <TouchableOpacity style={styles.closeButton} onPress={toggleProjModal}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>

      <Modal visible={isMapModalVisible} animationType="slide">
        <Map></Map>
        <TouchableOpacity style={styles.closeButton} onPress={toggleMapModal}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

export default Header;

const styles = {
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoImage: {
    width: 24,
    height: 24,
  },
  fixContainer: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fixImage: {
    width: 24,
    height: 24,
  },
  satContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  satImage: {
    width: 24,
    height: 24,
  },
  satText: {
    marginLeft: 8,
  },
  settingsButton: {
    width: 24,
    height: 24,
  },
    closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
};
