import React, { useState, useEffect, useContext } from 'react';
import { View, Button, Modal, Text } from 'react-native';
import { styles } from '../../Styles/styles';
import { useExport } from '../../hooks/useExport';
import { DataContext } from '../../Functions/DataContext';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';
import SoundPlayer from 'react-native-sound-player';


export default ExportModal = ({
    projectSettings,
    updateProjectSettings,
}) => {
    const {data} = useContext(DataContext);
    const { handleExport } = useExport();
    const path = RNFS.DownloadDirectoryPath;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={projectSettings.showExportModal}
            onRequestClose={() => {
                updateProjectSettings({
                    showExportModal: !projectSettings.showExportModal,
                });
            }}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Vyber druh exportu:</Text>
                <View style={styles.exportButtonContainer}>
                    <Button
                        style={styles.exportButton}         // Style on default buttons has no effect, kept if it would be useful in the future
                        title="Plný JSON"
                        onPress={async () => {
                            console.log('Current projectId:', data.projectSettings.projectId);
                            console.log('All project settings:', data.projectSettings);
                            try {
                                await handleExport("full");
                                Snackbar.show({
                                    text: `Soubor uložen do \r\n${path}`,
                                    duration: Snackbar.LENGTH_SHORT,
                                    textColor: 'green',
                                    marginBottom: 5,
                                  });
                            } catch (error){
                                console.error(`Export button error: ${error}`);
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
                        title="GNSS protokol"
                        onPress={async () => {
                            console.log('Current projectId:', data.projectSettings.projectId);
                            console.log('All project settings:', data.projectSettings);
                            try {
                                await handleExport("protocol");
                                Snackbar.show({
                                    text: `Soubor uložen do \r\n${path}`,
                                    duration: Snackbar.LENGTH_SHORT,
                                    textColor: 'green',
                                    marginBottom: 5,
                                  });
                            } catch (error){
                                console.error(`Export button error: ${error}`);
                            }
                        }}
                    />
                    <Button
                        style={styles.exportButton}
                        title="Prostý seznam souřadnic"
                        onPress={async () => {
                            console.log('Current projectId:', data.projectSettings.projectId);
                            console.log('All project settings:', data.projectSettings);
                            try {
                                await handleExport("coordinates");
                                SoundPlayer.playAsset(require("../../Sounds/export_success.mp3"));
                                Snackbar.show({
                                    text: `Soubor uložen do \r\n${path}`,
                                    duration: Snackbar.LENGTH_SHORT,
                                    textColor: 'green',
                                    marginBottom: 5,
                                  });
                            } catch (error){
                                console.error(`Export button error: ${error}`);
                            }
                        }}
                    />
                    <Button
                        style={styles.exportButton}
                        title="Zavřít okno"
                        onPress={() => {
                            updateProjectSettings({
                                showExportModal: !projectSettings.showExportModal,
                            });
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};