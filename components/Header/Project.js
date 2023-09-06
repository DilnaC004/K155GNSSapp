import React, {useState, useEffect, useContext} from 'react';
import {View, Button} from 'react-native';
import RNFS, {DocumentDirectoryPath, writeFile} from 'react-native-fs';
import {DataContext} from '../Functions/DataContext';
import {styles} from '../Styles/styles';
import Snackbar from 'react-native-snackbar';
import CreatePoint from './ProjectComponents/CreatePoint';
import CreateProject from './ProjectComponents/CreateProject';
import FlatListProject from './ProjectComponents/FlatListProject';
import FlatListPoint from './ProjectComponents/FlatListPoint';
import ProjectDescription from './ProjectComponents/ProjectDescription';

export default Project = ({clearStorage}) => {
  const {data, updateData} = useContext(DataContext);
  const [pointSettings, setPointSettings] = useState(data.pointSettings);
  const updatePointSettings = newSettings => {
    setPointSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  const [projectSettings, setProjectSettings] = useState(data.projectSettings);
  const updateProjectSettings = newSettings => {
    setProjectSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Function to export points into txt
  const exportPoints = async () => {
    const filePath = RNFS.DownloadDirectoryPath + '/GNSSappDATA.txt';
    try {
      await RNFS.writeFile(filePath, JSON.stringify(data), 'utf8');
      console.log('File saved successfully');
      Snackbar.show({
        text: `Soubor uložen do \r\n${filePath}`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'red',
        marginBottom: 5,
      });
    } catch (error) {
      console.log('Error saving file: ', error);
    }
  };

  useEffect(() => {
    return () => {
      updateData({
        pointSettings: pointSettings,
        projectSettings: projectSettings,
      });
    };
  }, [pointSettings, projectSettings]);

  return (
    <View style={styles.nastContainer}>
      <ProjectDescription projectSettings={projectSettings} />
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
        <CreateProject />
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
      {projectSettings.showPointFlatList &&
        data.projects != null && ( // conditional rendering based on the new piece of state
          <FlatListPoint
            projectSettings={projectSettings}
            updateProjectSettings={updateProjectSettings}
          />
        )}
      {projectSettings.showCreatePoint && ( // conditional rendering based on the new piece of state
        <CreatePoint
          updatePointSetting={updatePointSettings}
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
            Snackbar.show({
              text: 'Tato funkce není dostupná',
              duration: Snackbar.LENGTH_SHORT,
              textColor: 'red',
              marginBottom: 5,
            });
            if (projectSettings.projectId != 'null') {
            }
          }}
        />
      </View>
    </View>
  );
};
