import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const Header = ({nmeaParsed, coordStatus, setModalVisible, isModalVisible, setModalType}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => {setModalVisible(!isModalVisible); setModalType("point");}} >
        <Icon name="dot-circle-o" size={32} color={coordStatus} />
        <Text style={styles.infoText}>{nmeaParsed.quality}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setModalVisible(!isModalVisible); setModalType("placing");}} >
        <Icon name="flag" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setModalVisible(!isModalVisible); setModalType("skyplot");}} >
        <IconFontAwesome5 name="satellite" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setModalVisible(!isModalVisible); setModalType("bluetooth");}} >
        <Icon name="bluetooth" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setModalVisible(!isModalVisible); setModalType("ntrip");}} >
        <IconFontAwesome5  name="server" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setModalVisible(!isModalVisible); setModalType("project");}} >
        <Icon name="folder" size={32} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {setModalVisible(!isModalVisible); setModalType("map");}} >
        <Icon name="map" size={32} color="black" />
      </TouchableOpacity>
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
  infoText: {
    fontSize: 10,
  },
};
