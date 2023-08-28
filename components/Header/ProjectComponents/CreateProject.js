import React, {useState} from 'react';
import {TextInput, View, Button} from 'react-native';
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  isInProgress,
  types,
} from 'react-native-document-picker';
import {styles} from '../../Styles/styles';

export default CreateProject = ({
  data,
  updateData,
  projectSettings,
  updateProjectSettings,
}) => {
  const [newProject, setProject] = useState({
    title: '',
    date: '',
    description: '',
    path: '',
    points: [],
  });

  const updateProject = newSettings => {
    setProject(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // function to add the new project to the array
  const addProject = () => {
    updateProject({date: new Date().toLocaleString()});
    const updatedData = [...data.projects, newProject];
    updateData({projects: updateData});
    updateProject({title: '', date: '', description: ''});
    console.log('Save new project' + newProject);
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
              updateProject({patch: value});
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
        }}
      />
      <View style={styles.hrLine}/>
    </View>
  );
};
