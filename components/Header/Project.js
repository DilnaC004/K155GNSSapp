import React, { useState, useEffect, useRef} from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, FlatList, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SelectDropdown from 'react-native-select-dropdown';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  isInProgress,
  types,
} from 'react-native-document-picker'
import RNFS, { DocumentDirectoryPath, writeFile }from 'react-native-fs';

import { styles } from '../Styles/styles';

import { etrs2jtsk, jtsk2etrs} from '../Calculations/transformation'

const ItemProject = ({item, onPress, backgroundColor, textColor}) => (
  <TouchableOpacity onPress={onPress} style={[styles.boldText, {backgroundColor}]}>
    <Text style={[styles.title, {color: textColor}]}>{item.title} </Text>
  </TouchableOpacity>
);

const ItemPoint = ({ item, onPress, backgroundColor, textColor, textColor1 }) => (
  <ScrollView
    horizontal
    contentContainerStyle={styles.scrollViewContent}
    showsHorizontalScrollIndicator={false}
  >
    <Text style={[styles.title, { color: textColor1 }]}>{item.title} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>B </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.b} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>L </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.l} </Text>
    <Text style={[styles.title, { color: textColor1 }]}>H </Text>
    <Text style={[styles.title, { color: textColor }]}>{item.h} </Text>
  </ScrollView>
);

const Project = ({pointSettings, updatePointSetting, projectSettings, updateProjectSettings, data, updateData, clearStorage}) => {
  const [newProject, setProject] = useState({
    title: '',
    date: '',
    description: '',
    path: '',
    points:[],
  });
  const updateProject = newSettings => {
    setProject(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // state point inputs
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const switchCoordinates = isEnabled ? 'ETRS89' : 'S-JTSK';
  const switchX = isEnabled ? 'L [DMS]' : 'X [m]';
  const switchY = isEnabled ? 'B [DMS]' : 'Y [m]';
  const switchZ = isEnabled ? 'H [DMS]' : 'H [m]';

  // function to add the new project to the array
  const addProject = () => {
    updateProject({date: new Date().toLocaleString()});
    console.log(newProject);
    updateData({projects: [...data.projects, newProject] })
    updateProject({title:'', date: '', description: ''});
    updateProjectSettings({showCreateProject: !projectSettings.showCreateProject});
    console.log('Save new project' + newProject);
  };

  // add point into list of points and async storage NEED TO OPTIMAZE
  const addPoint = () => {
    if (isEnabled) {
      updatePointSetting({accuB: 0,accuL:0, accuH:0, pdop:0, time:0, code:'input', date: new Date().toLocaleString()})
    } else {
      const etrs = jtsk2etrs(y, x, z);
      updatePointSetting({b:etrs.B, l:etrs.L, h:etrs.H, accuB: 0,accuL:0, accuH:0, pdop:0, time:0, code:'input', date: new Date().toLocaleString()})
    }

    updateProjectSettings({points: [...projectSettings.points, pointSettings]})

    const updatedData = data.projects.map((project, index) => {
      if (index === projectSettings.projectId) {
        const updatedPoints = [...project.points, newPoint];
        return {...project, points: updatedPoints};
      }
      return project;
    });
    updateData({projects: updatedData });
    console.log('Add point ' + pointSettings.title + ' to project ' + data.projects[projectSettings.projectId].title);
    updateProjectSettings({showCreatePoint: !projectSettings.showCreatePoint});
  };

  // Function to delete a project from the data array
  const deleteProject = projectTitleToDelete => {
    const updatedData = data.filter(
      project => project.title !== projectTitleToDelete,
    );
    updateData({projects: updateData });
  };

  // Function to delete a point from a project in the data array
  const deletePoint = (projectTitleToDelete, pointTitleToDelete) => {
    const updatedData = data.map(project => {
      if (project.title === projectTitleToDelete) {
        const updatedPoints = project.points.filter(
          point => point.title !== pointTitleToDelete,
        );
        setProjectPoints(updatedPoints);
        updateProjectSettings({projectPointCount: updatedPoints.length});  
        return {...project, points: updatedPoints};
      }
      return project;
    });
    updateData({projects: updateData });
  };

  // Function to export points into txt
  const exportPoints = async () =>{
    const filePath = RNFS.ExternalDirectoryPath + '/example.txt';
    const path = `${DocumentDirectoryPath}/${Date.now()}.txt`;
    
    try {
      await RNFS.writeFile(filePath, data, 'utf8');
      console.log('File saved successfully');
    } catch (error) {
      console.log('Error saving file: ', error);
    }
  }

  const renderItemProject = ({item}) => {
    const backgroundColor = item.title === projectSettings.projectTitle ? '#ccc' : '#ccc1';
    const color = item.title === projectSettings.projectTitle ? 'white' : 'black';

    return (
      <View style={styles.buttonContainer}>
        <ItemProject
          item={item}
          onPress={() => {
            updateProjectSettings({projectPointCount: item.points.length, projectDate:item.date, projectTitle: item.title, showFlatList:false, projectId:data.indexOf(item), points:item.points});
            updateProjectSettings({points:item.points});
          }}
          backgroundColor={backgroundColor}
          textColor={color}
        />
        <TouchableOpacity onPress={() => {}}>
          <IconMaterialIcons name="delete" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItemPoint = ({item}) => {
    return (
      <View style={styles.buttonContainer}>
        <ItemPoint
          item={item}
          textColor={'gray'}
          textColor1={'white'}
        />
        <TouchableOpacity onPress={() => {}}>
          <IconMaterialIcons name="delete" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.domovContainer}>
      <View style={styles.zakazkaInfo}>
        <Text>
          <Text style={styles.boldText}>Informace o aktuální zakázce</Text>
          {'\n'}
          <Text id="INFOnazevZakazky">Název zakázky: {projectSettings.projectTitle}</Text>
          {'\n'}
          <Text id="INFOdatumVytvoreni">Datum vytvoření: {projectSettings.projectDate}</Text>
          {'\n'}
          <Text id="INFOpocetBodu">
            Počet změřených bodů: {projectSettings.projectPointCount}
          </Text>
        </Text>
      </View>
      <View style={styles.hrLine} />
      <View style={styles.buttonContainer}>
        <Button
          title="Vyber Zakázku"
          onPress={() => {
            updateProjectSettings({showFlatList:!projectSettings.showFlatList});
          }}
        />
        <Button
          title="Vytvoř zakázku"
          onPress={() => {
            updateProjectSettings({showCreateProject: !projectSettings.showCreateProject});
          }}
        />
      </View>
      {projectSettings.showFlatList && ( // conditional rendering based on the new piece of state
        <View style={{height: 100}}>
          <FlatList
            data={data}
            renderItem={renderItemProject}
            keyExtractor={item => item.title}
            extraData={projectSettings.projectTitle}
          />
        </View>
      )}
      {projectSettings.showCreateProject && ( // conditional rendering based on the new piece of state
        <View>
          <TextInput
            style={styles.textInput}
            placeholder="Název zakázky"
            value={newProject.title}
            onChangeText={(value) => {updateProject({title: value}) }}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Popis"
            multiline={true}
            value={newProject.description}
            onChangeText={(value) => {updateProject({description: value}) }}
          />
          <Button
            title="Vyber cestu k projektu"
            onPress={() => {
              DocumentPicker.pickDirectory().then((value) => { updateProject({patch:value})} ).catch(e => {console.log(e)});
            }}
          />
          <Button title="Založ zakázku" onPress={() => {
            addProject(); 
            }} />
        </View>
      )}
      <View style={styles.hrLine} />
      <View style={styles.buttonContainer}>
        <Button
          title="Zobraz uložené body"
          onPress={() => {
            if (projectSettings.projectId != 'null') {
              updateProjectSettings({showPointFlatList: !projectSettings.showPointFlatList});
            }
          }}
        />
        <Button
          title="Vlož bod"
          onPress={() => {
            if (projectSettings.projectId != 'null') {
              updateProjectSettings({showCreatePoint: !projectSettings.showCreatePoint});
            }
          }}
        />
      </View>
      {projectSettings.showPointFlatList && ( // conditional rendering based on the new piece of state
        <View style={{height: 120}}>
          <FlatList
            data={projectSettings.points}
            renderItem={renderItemPoint}
            keyExtractor={item => item.title}
          />
          <View style={styles.hrLine} />
        </View>
      )}
      {projectSettings.showCreatePoint && ( // conditional rendering based on the new piece of state
        <View>
          <View style={styles.buttonContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Název bodu"
              value={pointSettings.title}
               onChangeText={(value) => {updatePointSetting({title: value})}}
            />
            <Text>{switchCoordinates}</Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
              style={styles.switch}
            />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder={switchY}
            value={pointSettings.l}
            onChangeText={(value) => {updatePointSetting({l:value})}}
            maxLength={11} // Set the maximum number of characters allowed
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <TextInput
            style={styles.textInput}
            placeholder={switchX}
            value={pointSettings.b}
            onChangeText={(value) => {updatePointSetting({b:value})}}
            maxLength={11} // Set the maximum number of characters allowed
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <TextInput
            style={styles.textInput}
            placeholder={switchZ}
            value={pointSettings.h}
            onChangeText={(value) => {updatePointSetting({h:value})}}
            maxLength={7} // Set the maximum number of characters allowed
            keyboardType="numeric" // Set the keyboard to numeric mode
          />
          <Button title="Ulož bod" onPress={addPoint} />
        </View>
      )}

      <View style={styles.hrLine} />

      <View style={styles.buttonContainer}>
        <Button
          title="Exportuj body"
          onPress={() => {
            exportPoints();
          }}
        />
        <Button
          title="Importuj body"
          onPress={() => {
            if (projectSettings.projectId != 'null') {
            }
          }}
        />
        <Button
          title="Vše vymaž"
          onPress={() => {
            clearStorage();
            updateData({projects: []})
          }}
        />
      </View>
    </View>
  );
};

export default Project;