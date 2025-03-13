import React, { useState, useEffect, useContext } from 'react';
import { View, Button, Dimensions, Text } from 'react-native';
import { DataContext } from '../Functions/DataContext';
import { styles } from '../Styles/styles';
import Snackbar from 'react-native-snackbar';
import CreatePoint from './ProjectComponents/CreatePoint';
import CreateProject from './ProjectComponents/CreateProject';
import FlatListProject from './ProjectComponents/FlatListProject';
import FlatListPoint from './ProjectComponents/FlatListPoint';
import ProjectDescription from './ProjectComponents/ProjectDescription';
import ExportModal from './ProjectComponents/ExportModal';
import ImportModal from './ProjectComponents/ImportModal';

export default Project = ({ clearStorage, setPlacingSettings }) => {
  const { data, updateData } = useContext(DataContext);
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

  const closeAll = () => {
    updateProjectSettings({
      showFlatList: false,
      showCreatePoint: false,
      showCreateProject: false,
      showPointFlatList: false,
      showExportModal: false,
      showImportModal: false
    });
  }

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
      <Text style={styles.headline}>Správa dat</Text>
      <ProjectDescription projectSettings={projectSettings} />
      <View style={styles.buttonContainer}>
        <Button
          title="Vyber Zakázku"
          onPress={() => {
            closeAll();
            updateProjectSettings({
              showFlatList: !projectSettings.showFlatList,
            });
          }}
        />
        <Button
          title="Vytvoř zakázku"
          onPress={() => {
            closeAll();
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
          setPlacingSettings={setPlacingSettings}
        />
      )}
      {projectSettings.showCreateProject && ( // conditional rendering based on the new piece of state
        <CreateProject updateProjectSettings={updateProjectSettings}/>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Zobraz uložené body"
          onPress={() => {
            closeAll();
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
            closeAll();
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
            placing={false}
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
          title="Export"
          onPress={() => {
            closeAll();
            if (projectSettings.projectId != 'null') {
              updateProjectSettings({
                showExportModal: !projectSettings.showExportModal,
              });
            } else {
              Snackbar.show({
                text: 'Zvol zakázku!',
                duration: Snackbar.LENGTH_SHORT,
                textColor: 'red',
                marginBottom: 5,
              });
            }
          }}
        />
        <Button
          title="Import"
          onPress={() => {
            closeAll();
            if (projectSettings.projectId != 'null') {
              updateProjectSettings({
                showImportModal: !projectSettings.showImportModal,
              });
            } else {
              Snackbar.show({
                text: 'Zvol zakázku!',
                duration: Snackbar.LENGTH_SHORT,
                textColor: 'red',
                marginBottom: 5,
              });
            }
          }}
        />
        {projectSettings.showExportModal &&
          data.projects != null && (
            <ExportModal
              projectSettings={projectSettings}
              updateProjectSettings={updateProjectSettings}
            />
          )}
        {projectSettings.showImportModal &&
          data.projects != null && (
            <ImportModal
              projectSettings={projectSettings}
              updateProjectSettings={updateProjectSettings}
            />
          )}
      </View>
    </View>
  );
};
