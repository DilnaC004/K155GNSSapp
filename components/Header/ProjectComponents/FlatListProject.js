import React, {useContext, useEffect} from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Button,
  PermissionsAndroid,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { DataContext } from '../../Functions/DataContext';
import {styles} from '../../Styles/styles';

const ItemProject = ({item, onPress, backgroundColor, textColor}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.boldText, {backgroundColor}]}>
    <Text style={[styles.title, {color: textColor}]}>{item.title} </Text>
  </TouchableOpacity>
);

export default FlatListProject = ({
  projectSettings,
  updateProjectSettings,
}) => {
  const { data, updateData} = useContext(DataContext);
  const renderItemProject = ({item}) => {
    const backgroundColor =
      item.title === projectSettings.title ? '#ccc' : '#ccc1';
    const color =
      item.title === projectSettings.title ? 'white' : 'black';

    return (
      <View style={styles.buttonContainer}>
        <ItemProject
          item={item}
          onPress={() => {
            updateProjectSettings({
              projectPointCount: item.points.length,
              date: item.date,
              title: item.title,
              description: item.description,
              showFlatList: false,
              projectId: data.projects.indexOf(item),
            });
          }}
          backgroundColor={backgroundColor}
          textColor={color}
        />
        <TouchableOpacity
          onPress={() => {
            deleteProject(item.title);
          }}>
          <Image
            source={require('../../Images/trash.png')}
            style={[styles.icon]}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Function to delete a project from the data array
  const deleteProject = projectTitleToDelete => {
    const updatedData = data.projects.filter(
      project => project.title !== projectTitleToDelete,
    );
    updateData({projects: updatedData});
  };

  return (
    <View style={{ height: Dimensions.get("window").height/3 }}>
      <FlatList
        data={data.projects}
        renderItem={renderItemProject}
        keyExtractor={item => item.title}
      />
      <View style={styles.hrLine} />
    </View>
  );
};
