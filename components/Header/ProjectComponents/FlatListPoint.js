import React, { useContext } from 'react';
import { FlatList, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { DataContext } from '../../Functions/DataContext';
import { styles } from '../../Styles/styles';

const ItemPoint = ({ item, onPress, backgroundColor, textColor, textColor1 }) => (
  <ScrollView
    horizontal
    contentContainerStyle={styles.scrollViewContent}
    showsHorizontalScrollIndicator={false}>
    <Text style={[styles.title, { color: textColor }]}>{item.title} </Text>
    <Text style={[styles.title, { color: textColor }]}>B </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.b} </Text>
    <Text style={[styles.title, { color: textColor }]}>L </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.l} </Text>
    <Text style={[styles.title, { color: textColor }]}>H </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.h} </Text>
  </ScrollView>
);

export default FlatListPoint = ({
  projectSettings,
  updateProjectSettings,
  placing,
}) => {
  const { data, updateData } = useContext(DataContext);

  const renderItemPoint = ({ item, index }) => {
    return (
      <View style={styles.buttonContainer}>
        <ItemPoint item={item} textColor={'gray'} textColor1={'white'} />
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
        renderItem={renderItemPoint}
        keyExtractor={item => item.title}
      />
      <View style={styles.hrLine} />
    </View>
  );
};
