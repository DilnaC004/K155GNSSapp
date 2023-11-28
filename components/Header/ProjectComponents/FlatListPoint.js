import React, { useContext, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { DataContext } from '../../Functions/DataContext';
import { styles } from '../../Styles/styles';

const ItemID = ({ item, textColor }) => (
  <ScrollView
    horizontal
    contentContainerStyle={styles.scrollViewContent}
    showsHorizontalScrollIndicator={false}>
    <Text style={[styles.title, { color: textColor }]}>{item.title} </Text>
  </ScrollView>
);

const ItemInfo = ({ item, textColor }) => (
  <View>
    <Text style={[styles.title, { color: textColor }]}>Bod: {item.title}</Text>
    <Text style={[styles.title, { color: textColor }]}>B: {item.b}</Text>
    <Text style={[styles.title, { color: textColor }]}>L: {item.l}</Text>
    <Text style={[styles.title, { color: textColor }]}>H: {item.h}</Text>
  </View>
);

export default FlatListPoint = ({
  projectSettings,
  updateProjectSettings,
  placing,
}) => {
  const { data, updateData } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const renderItemID = ({ item, index }) => {
    return (
      <View style={styles.buttonContainer}>
        <ItemID item={item} textColor={'gray'} />
        <TouchableOpacity
          onPress={() => {
            setSelectedPoint(item);
            setModalVisible(true);
          }}>
          <IconMaterialIcons name="info" size={24} color="black" />
        </TouchableOpacity>
        {!placing &&
          <TouchableOpacity
            onPress={() => {
              deletePoint(item.title, data.projects[projectSettings.projectId].title);
            }}>
            <IconMaterialIcons name="delete" size={24} color="black" />
          </TouchableOpacity>}
        {placing && <TouchableOpacity
          onPress={() => {
            updateProjectSettings(index);
            console.log('Kliknuto')
          }}>
          <IconMaterialIcons name="save" size={24} color="black" />
        </TouchableOpacity>}
      </View >
    );
  };

  // Function to delete a point from a project in the data array
  const deletePoint = (pointTitleToDelete, projectTitleToDelete) => {
    console.log('delete point ' + pointTitleToDelete + 'in project ' + projectTitleToDelete);

    const updatedData = data.projects.map(project => {
      if (project.title === projectTitleToDelete) {
        const updatedPoints = project.points.filter(
          point => point.title !== pointTitleToDelete,
        );
        console.log(updatedPoints);
        updateProjectSettings({ projectPointCount: updatedPoints.length });
        return { ...project, points: updatedPoints };
      }
      return project;
    });
    updateData({ projects: updatedData });

  };

  return (
    <View style={{ height: 120 }}>
      <FlatList
        data={data.projects[projectSettings.projectId].points}
        renderItem={renderItemID}
        keyExtractor={item => item.title}
      />
      <View style={styles.hrLine} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={{ marginTop: 22 }}>
          <View style={styles.modalView}>
            <ItemInfo item={selectedPoint} textColor={'black'} />
            <TouchableOpacity
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
              <Text>Zavřít okno</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>

  );
};
