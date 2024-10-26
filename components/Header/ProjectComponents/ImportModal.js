import React, { useState, useEffect, useContext } from 'react';
import { View, Button, Modal, Text } from 'react-native';
import { styles } from '../../Styles/styles';
import { useImport } from '../../hooks/useImport';
import { DataContext } from '../../Functions/DataContext';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';


export default ImportModal = ({
    projectSettings,
    updateProjectSettings,
}) => {
    const {data} = useContext(DataContext);
    //const { handleImport, handlePath } = useImport();
    const path = RNFS.DownloadDirectoryPath;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={projectSettings.showImportModal}
            onRequestClose={() => {
                updateProjectSettings({
                    showImportModal: !projectSettings.showImportModal,
                });
            }}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Vyber druh exportu:</Text>
                <View style={styles.importButtonContainer}>
                    <Button
                        style={styles.exportButton}         // Style on default buttons has no effect, kept if it would be useful in the future
                        title="Zvol soubor"
                        onPress={async () => {
                            try {
                                //await handlePath();
                                Snackbar.show({
                                    text: `Soubor nalezen v \r\n${path}`,
                                    duration: Snackbar.LENGTH_SHORT,
                                    textColor: 'green',
                                    marginBottom: 5,
                                  });
                                updateProjectSettings({
                                    showImportModal: false,
                                })
                            } catch (error){
                                console.error(`Import button error: ${error}`);
                                Snackbar.show({
                                    text: `Chyba: ${error.message}`,
                                    duration: Snackbar.LENGTH_SHORT,
                                    textColor: 'red',
                                    marginBottom: 5,
                                  });
                            }
                        }}
                    />
                    <Button
                        style={styles.exportButton}
                        title="Proveď import"
                        disabled={path? true : false}
                        onPress={async () => {
                            console.log('Current projectId:', data.projectSettings.projectId);
                            console.log('All project settings:', data.projectSettings);
                            try {
                                if (path != null) {
                                    //await handleImport();
                                    updateProjectSettings({
                                        showImportModal: false,
                                    })
                                } else {

                                }
                            } catch (error){
                                console.error(`Import button error: ${error}`);
                            }
                        }}
                    />
                    <Button
                        style={styles.exportButton}
                        title="Zavřít okno"
                        onPress={() => {
                            updateProjectSettings({
                                showImportModal: !projectSettings.showImportModal,
                            });
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};