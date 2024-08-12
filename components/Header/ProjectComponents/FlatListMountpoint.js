import React, { useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, Modal, Button, Image } from 'react-native';
import { styles } from '../../Styles/styles';

const Item = ({ item, onSelect, onInfoPress, isSelected }) => (
    <View style={styles.buttonContainer}>
    <TouchableOpacity onPress={() => onSelect(item)}>
      <Text style={[styles.title, isSelected && { color: 'red' }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onInfoPress(item)}>
      <Image
        source={require('../../Images/info.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  </View>
);

const FlatListMountpoint = ({ mountpoints, onSelectMountpoint }) => {
  const [selectedMountpoint, setSelectedMountpoint] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }) => (
    <Item
      item={item}
      onSelect={(selected) => {
        setSelectedMountpoint(selected);
        onSelectMountpoint(selected);
      }}
      onInfoPress={(item) => {
        setSelectedMountpoint(item);
        setModalVisible(true);
      }}
      isSelected={selectedMountpoint && selectedMountpoint.id === item.id}
    />
  );

  const getCarrierText = (carrier) => {
    switch (carrier) {
      case '0':
        return 'Žádné informace';
      case '1':
        return 'L1';
      case '2':
        return 'L1+L2';
      default:
        return 'Chyba';
    }
  };

  return (
    <View style={{ height: 240 }}>
      <FlatList
        data={mountpoints}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      {selectedMountpoint && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Podrobnosti mountpointu</Text>
            <Text style={styles.title}>ID: {selectedMountpoint.id}</Text>
            <Text style={styles.title}>Název: {selectedMountpoint.name}</Text>
            <Text style={styles.title}>Formát dat: {selectedMountpoint.format}</Text>
            <Text style={styles.title}>Nosné vlny: {getCarrierText(selectedMountpoint.carrier)}</Text>
            <Text style={styles.title}>Navigační sytémy: {selectedMountpoint.navSystem}</Text>
            <Text style={styles.title}>Síť: {selectedMountpoint.networkName}</Text>
            <Text style={styles.title}>Stát: {selectedMountpoint.country}</Text>
            <Text style={styles.title}>Zeměpisná šířka: {selectedMountpoint.latitude}°</Text>
            <Text style={styles.title}>Zeměpisná délka: {selectedMountpoint.longitude}°</Text>
            <Text style={styles.title}>Je virtuální: {selectedMountpoint.isVirtual ? 'Ano' : 'Ne'}</Text>
            <Text style={styles.title}>Je síťové řešení: {selectedMountpoint.isNetworkSolution ? 'Ano' : 'Ne'}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
      )}
    </View>
  );
};

export default FlatListMountpoint;