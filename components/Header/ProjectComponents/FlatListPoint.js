import React, {useContext} from 'react';
import {FlatList, View, Text, TouchableOpacity, ScrollView} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { DataContext } from '../../Functions/DataContext';
import {styles} from '../../Styles/styles';

const ItemPoint = ({item, onPress, backgroundColor, textColor, textColor1}) => (
  <ScrollView
    horizontal
    contentContainerStyle={styles.scrollViewContent}
    showsHorizontalScrollIndicator={false}>
    <Text style={[styles.title, {color: textColor1}]}>{item.title} </Text>
    <Text style={[styles.title, {color: textColor1}]}>B </Text>
    <Text style={[styles.title, {color: textColor}]}>{item.b} </Text>
    <Text style={[styles.title, {color: textColor1}]}>L </Text>
    <Text style={[styles.title, {color: textColor}]}>{item.l} </Text>
    <Text style={[styles.title, {color: textColor1}]}>H </Text>
    <Text style={[styles.title, {color: textColor}]}>{item.h} </Text>
  </ScrollView>
);

export default FlatListPoint = ({
  projectSettings,
  updateProjectSettings,
}) => {
  const { data, updateData} = useContext(DataContext);
  const renderItemPoint = ({item}) => {
    return (
      <View style={styles.buttonContainer}>
        <ItemPoint item={item} textColor={'gray'} textColor1={'white'} />
        <TouchableOpacity
          onPress={() => {
            deletePoint();
          }}>
          <IconMaterialIcons name="delete" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  // Function to delete a point from a project in the data array
  const deletePoint = (projectTitleToDelete, pointTitleToDelete) => {
    const updatedData = data.project[projectSettings.projectId].map(project => {
      if (project.title === projectTitleToDelete) {
        const updatedPoints = project.points.filter(
          point => point.title !== pointTitleToDelete,
        );
        updateProjectSettings({projectPointCount: updatedPoints.length});
        return {...project, points: updatedPoints};
      }
      return project;
    });
    updateData({projects: updateData});
  };

  return (
    <View style={{height: 120}}>
      <FlatList
        data={data.projects[projectSettings.projectId].points}
        renderItem={renderItemPoint}
        keyExtractor={item => item.title}
      />
      <View style={styles.hrLine} />
    </View>
  );
};
