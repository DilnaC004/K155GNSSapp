import React, { useState, useEffect, useContext } from 'react';
import { View, Button, Modal, Text } from 'react-native';
import { styles } from '../../Styles/styles';
import { useImport } from '../../hooks/useImport';
import { DataContext } from '../../Functions/DataContext';
import Snackbar from 'react-native-snackbar';
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isCancel,
  pickSingle,
  isInProgress,
  types,
  pick,
} from 'react-native-document-picker';


export default ImportModal = ({
    projectSettings,
    updateProjectSettings,
}) => {
    const { data } = useContext(DataContext);
    const { handleImport } = useImport();
    const [ pickedFile, setPickedFile ] = useState(null);

    const pickDocument = async () => {
        try {
          const result = await DocumentPicker.pick({
            type: [types.plainText, types.csv],
            copyTo: 'cachesDirectory', // proper path
            allowMultiSelection: false,
          });

          setPickedFile(result[0]);
          
          Snackbar.show({
            text: `Soubor nalezen: ${result[0].name}`,         // using result here because set is async
            duration: Snackbar.LENGTH_SHORT,
            textColor: 'green',
            marginBottom: 5,
          });
    
          console.log('Zvolený soubor:', {
            uri: result[0].fileCopyUri || result[0].uri,
            type: result[0].type,
            name: result[0].name,
            size: result[0].size
          });
    
        } catch (error) {
          if (DocumentPicker.isCancel(error)) {
            console.log('Picker zrušen uživatelem');
            return;
          }
          
          console.error('Document picker error:', error);
          Snackbar.show({
            text: `Chyba: ${error.message || 'Nepodařilo se načíst soubor'}`,
            duration: Snackbar.LENGTH_SHORT,
            textColor: 'red',
            marginBottom: 5,
          });
        }
    }

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
                        onPress={pickDocument}
                    />
                    <Button
                        style={styles.exportButton}
                        title="Proveď import"
                        disabled={pickedFile == null ? true : false}
                        onPress={async () => {
                            console.log('Current projectId:', data.projectSettings.projectId);
                            console.log('All project settings:', data.projectSettings);
                            try {            
                                await handleImport(pickedFile);
                                updateProjectSettings({
                                    showImportModal: false,
                                })
                            } catch (error) {
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