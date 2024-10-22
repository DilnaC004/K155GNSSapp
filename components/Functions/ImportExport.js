import React from 'react';
import RNFS from 'react-native-fs';
import { PERMISSIONS, request } from 'react-native-permissions';
import Snackbar from 'react-native-snackbar';

// Custom hook to access data context
const useDataContext = (DataContext) => {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

// Helper function to show snackbar
const showSnackbar = (text, textColor = 'green') => {
  Snackbar.show({
    text,
    duration: Snackbar.LENGTH_SHORT,
    textColor,
    marginBottom: 5,
  });
};

// Function to export raw data into txt
export const exportRawData = async (filePath, rawMeasurement) => {
  try {
    const permissionResult = await request(
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    );

    if (permissionResult !== 'granted') {
      showSnackbar('Nemáte oprávnění k zápisu do souboru', 'red');
      console.log('Permission to access storage was denied');
      return;
    }

    await RNFS.appendFile(filePath, rawMeasurement.toString(), 'utf8');
    console.log('File saved successfully to ' + filePath);
    showSnackbar(`Soubor uložen do \r\n${filePath}`);
  } catch (error) {
    console.log('Error saving file: ', error);
    showSnackbar(`Chyba \r\n${error}`, 'red');
  }
};

// Component wrapper for exporting points
export const ExportPoints = ({ DataContext }) => {
  const { data } = useDataContext(DataContext);

  const handleExport = async () => {
    const date = new Date();
    let dayString = date.getDate().toString();
    if (dayString.length === 1) dayString = `0${dayString}`;
    let monthString = (date.getMonth() + 1).toString();         // getMonth() is 0-based
    if (monthString.length === 1) monthString = `0${monthString}`; 
    const dateString = `${date.getFullYear()}${monthString}${dayString}`;
    
    const filePath = `${RNFS.DownloadDirectoryPath}/GNSSapp${dateString}.txt`;
    try {
      await RNFS.writeFile(filePath, JSON.stringify(data), 'utf8');
      console.log('File saved successfully');
      showSnackbar(`Soubor uložen do \r\n${filePath}`);
    } catch (error) {
      console.log('Error saving file: ', error);
      showSnackbar(`Chyba \r\n${error}`, 'red');
    }
  };

  return { handleExport };
};