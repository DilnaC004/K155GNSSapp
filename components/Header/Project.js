import React, {useState, useEffect, useContext} from 'react';
import {View, Button} from 'react-native';
import RNFS, {DocumentDirectoryPath, writeFile} from 'react-native-fs';
import { DataContext } from '../Functions/DataContext';
import {styles} from '../Styles/styles';

import CreatePoint from './ProjectComponents/CreatePoint';
import CreateProject from './ProjectComponents/CreateProject';
import FlatListProject from './ProjectComponents/FlatListProject';
import FlatListPoint from './ProjectComponents/FlatListPoint';
import ProjectDescription from './ProjectComponents/ProjectDescription';

const Project = ({
  pointSettings,
  updatePointSetting,
  projectSettings,
  updateProjectSettings,
  clearStorage,
}) => {

  const { data, updateData} = useContext(DataContext);

  // Function to export points into txt
  const exportPoints = async () => {
    const filePath = RNFS.ExternalDirectoryPath + '/example.txt';
    const path = `${DocumentDirectoryPath}/${Date.now()}.txt`;
    try {
      await RNFS.writeFile(filePath, data, 'utf8');
      console.log('File saved successfully');
    } catch (error) {
      console.log('Error saving file: ', error);
    }
  };

  return (
    <View style={styles.nastContainer}>
      <ProjectDescription projectSettings={projectSettings}/>
      <View style={styles.buttonContainer}>
        <Button
          title="Vyber Zakázku"
          onPress={() => {
            updateProjectSettings({
              showFlatList: !projectSettings.showFlatList,
            });
          }}
        />
        <Button
          title="Vytvoř zakázku"
          onPress={() => {
            updateProjectSettings({
              showCreateProject: !projectSettings.showCreateProject,
            });
          }}
        />
      </View>
      {projectSettings.showFlatList && ( // conditional rendering based on the new piece of state
        <FlatListProject
          projectSettings={projectSettings}
          updateProjectSettings={updateProjectSettings}
        />
      )}
      {projectSettings.showCreateProject && ( // conditional rendering based on the new piece of state
        <CreateProject
          projectSettings={projectSettings}
          updateProjectSettings={updatePointSetting}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Zobraz uložené body"
          onPress={() => {
            if (projectSettings.projectId != 'null') {
              updateProjectSettings({
                showPointFlatList: !projectSettings.showPointFlatList,
              });
            }
          }}
        />
        <Button
          title="Vlož bod"
          onPress={() => {
            if (projectSettings.projectId != 'null') {
              updateProjectSettings({
                showCreatePoint: !projectSettings.showCreatePoint,
              });
            }
          }}
        />
      </View>
      {projectSettings.showPointFlatList && data.projects != null &&( // conditional rendering based on the new piece of state
        <FlatListPoint
          projectSettings={projectSettings}
          updateProjectSettings={updateProjectSettings}
        />
      )}
      {projectSettings.showCreatePoint && ( // conditional rendering based on the new piece of state
        <CreatePoint
          updatePointSetting={updatePointSetting}
          pointSettings={pointSettings}
          projectSettings={projectSettings}
        />
      )}
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
            //clearStorage();
            updateData({projects: []});
          }}
        />
      </View>
    </View>
  );
};

export default Project;
