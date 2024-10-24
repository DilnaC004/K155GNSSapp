import React, { useContext, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, ScrollView, Modal, Button, Image, Dimensions } from 'react-native';
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
    <Text style={[styles.title, { color: textColor }]}>B: {item.b.toFixed(9)}°</Text>
    <Text style={[styles.title, { color: textColor }]}>L: {item.l.toFixed(9)}°</Text>
    <Text style={[styles.title, { color: textColor }]}>H: {item.h.toFixed(9)}m</Text>
    <Text style={[styles.title, { color: textColor }]}>X: {item.x.toFixed(3)}m</Text>
    <Text style={[styles.title, { color: textColor }]}>Y: {item.y.toFixed(3)}m</Text>
    <Text style={[styles.title, { color: textColor }]}>Hbpv: {item.z.toFixed(3)}m</Text>
    <Text style={[styles.title, { color: textColor }]}>PDOP: {item.pdop}</Text>
    <Text style={[styles.title, { color: textColor }]}>Výška antény: {item.height}m</Text>
    <Text style={[styles.title, { color: textColor }]}>Offset: {item.offset}m</Text>
  </View>
);

export default FlatListPoint = ({
  projectSettings,
  updateProjectSettings,
  placing,
}) => {
  const { data, updateData } = useContext(DataContext);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const renderItemID = ({ item, index }) => {
    return (
      <View style={styles.buttonContainer}>
        <ItemID item={item} textColor={'gray'} />
        <TouchableOpacity
          onPress={() => {
            setSelectedPoint(item);
            setModalVisible1(true);
          }}>
          <Image
            source={require('../../Images/info.png')}
            style={[styles.icon]}
          />
        </TouchableOpacity>
        {placing && <TouchableOpacity
          onPress={() => {
            updateProjectSettings(index);
          }}>
          <Image
            source={require('../../Images/flag.png')}
            style={[styles.icon]}
          />
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
    <View style={{ height: Dimensions.get("window").height/3 }}>
      <FlatList
        data={data.projects[projectSettings.projectId].points}
        renderItem={renderItemID}
        keyExtractor={item => item.title}
      />
      <View style={styles.hrLine} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible1}
        onRequestClose={() => {
          setModalVisible1(false);
        }}>
        <View style={{ marginTop: 22 }}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Podrobnosti bodu</Text>
            <ItemInfo item={selectedPoint} textColor={'black'} />
            <Button
              title="Zavřít okno"
              onPress={() => {
                setModalVisible1(!modalVisible1);
              }}
            />
            {!placing &&
              <TouchableOpacity
                onPress={() => {
                  setModalVisible2(true);
                }}>
                <Image
                  source={require('../../Images/trash.png')}
                  style={[styles.icon]}
                />
              </TouchableOpacity>}
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible2}
        onRequestClose={() => {
          setModalVisible2(false);
        }}>
        <View style={{ marginTop: 270 }}>
          <View style={styles.modalView}>
            <Text style={styles.title}>
              Opravdu chcete smazat tento bod?
            </Text>
            <Button
              title="Zpět"
              onPress={() => {
                setModalVisible2(!modalVisible2);
              }}
            />
            {!placing &&
              <TouchableOpacity
                onPress={() => {
                  deletePoint(selectedPoint.title, data.projects[projectSettings.projectId].title);
                  setModalVisible1(!modalVisible1);
                  setModalVisible2(!modalVisible2);
                }}>
                <Image
                  source={require('../../Images/trash.png')}
                  style={[styles.icon]}
                />
              </TouchableOpacity>}
          </View>
        </View>
      </Modal>
    </View>

  );
};
