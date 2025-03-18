import React, {useState, useContext} from 'react';
import {TextInput, View, Button} from 'react-native';
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  isInProgress,
  types,
} from 'react-native-document-picker';
import Snackbar from 'react-native-snackbar';
import { DataContext } from '../../Functions/DataContext';
import {styles} from '../../Styles/styles';
import SoundPlayer from 'react-native-sound-player';

export default CreateProject = ({updateProjectSettings}) => {
  const { data, updateData} = useContext(DataContext);

  const [newProject, setProject] = useState({
    title: '',
    date: '',
    description: '',
    path: '',
    points: [],
    pointCount: 0,
  });

  const updateProject = newSettings => {
    setProject(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // function to add the new project to the array
  const addProject = () => {
    if(newProject.title === ''){
      Snackbar.show({
        text: 'Vlož název zakázky',
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
      SoundPlayer.playAsset(require('../../Sounds/error.mp3'));
    } else {
      const projectToAdd = {
        ...newProject,
        date: new Date().toLocaleDateString('cs-CZ', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
      };

      const updatedData = [...data.projects, projectToAdd];
      updateData({projects: updatedData});
      
      setProject({
        title: '',
        date: '',
        description: '',
        path: '',
        points: [],
        pointCount: 0,
      });

      console.log('Save new project:', projectToAdd);
      SoundPlayer.playAsset(require('../../Sounds/success.mp3'));
    }
  };

  return (
    <View>
      <TextInput
        style={styles.textInput}
        placeholder="Název zakázky"
        value={newProject.title}
        onChangeText={value => {
          updateProject({title: value});
        }}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Popis"
        multiline={true}
        value={newProject.description}
        onChangeText={value => {
          updateProject({description: value});
        }}
      />
      <Button
        title="Vyber cestu k projektu"
        onPress={() => {
          DocumentPicker.pickDirectory()
            .then(value => {
              updateProject({path: value});
            })
            .catch(e => {
              console.log(e);
            });
        }}
      />
      <Button
        title="Založ zakázku"
        onPress={() => {
          addProject();
          updateProjectSettings({
            showCreateProject: false
          });
        }}
      />
      <View style={styles.hrLine}/>
    </View>
  );
};
