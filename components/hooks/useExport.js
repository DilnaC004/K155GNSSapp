import React, { useState, useContext } from 'react';
import RNFS from 'react-native-fs';
import { PERMISSIONS, request } from 'react-native-permissions';
import Snackbar from 'react-native-snackbar';
import { DataContext } from '../Functions/DataContext';
import SoundPlayer from 'react-native-sound-player';

const showSnackbar = (text, textColor = 'green') => {
  Snackbar.show({
    text,
    duration: Snackbar.LENGTH_SHORT,
    textColor,
    marginBottom: 5,
  });
};

export const useExport = () => {
  const { data } = useContext(DataContext);

  const formatDate = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${date.getFullYear()}${month}${day}`;
  };

  const validateProject = (project) => {
    if (!project || !project.points) {
      throw new Error('Nejsou k dispozici žádné body pro aktuální projekt');
    }
    return project;
  };

  const formatProtocolExport = (project) => {
    const header = "Bod          B [°]           L [°]           H [m]    X [m]           Y [m]          Hbpv [m]    σB [m]          σL [m]           σH [m]   PDOP    Čas           Výška [m]     Offset [m]    Kód";
    
    const points = project.points.map((point) => {
      return [
        point.title,
        point.b.toFixed(9),
        point.l.toFixed(9),
        point.h.toFixed(3),
        point.x.toFixed(3),
        point.y.toFixed(3),
        point.z.toFixed(3),
        point.accuB.toFixed(3),
        point.accuL.toFixed(3),
        point.accuH.toFixed(3),
        point.pdop.toFixed(1),
        point.time,
        point.height.toFixed(3),
        point.offset.toFixed(3),
        point.code
      ].join('    ');
    }).join('\n');

    return `${header}\n${points}`;
  };

  const formatCoordinatesExport = (project) => {
    const header = "Bod         Y             X           Hbpv    Kód";
    
    const points = project.points.map((point) => {
      return [
        point.title,
        point.y.toFixed(3),
        point.x.toFixed(3),
        point.z.toFixed(3),
        point.code
      ].join('    ');
    }).join('\n');

    return `${header}\n${points}`;
  };

  const handleExport = async (exportType) => {
    try {
      if (!data || !data.projectSettings) {
        throw new Error('Data nejsou k dispozici');
      }

      const projectId = data.projectSettings.projectId;

      if (projectId === undefined || projectId === null || projectId === 'null') {
        throw new Error('Není zvolena zakázka');
      }

      let exportContent;
      switch (exportType) {
        case 'full':
          console.log('Preparing full export...');
          exportContent = JSON.stringify(data.projects, null, 2);
          break;

        case 'protocol': {
          console.log('Preparing protocol export...');
          const project = data.projects[projectId];
          if (!project) {
            throw new Error(`Projekt s ID ${projectId} nebyl nalezen`);
          }
          const projectForProtocol = validateProject(project);
          exportContent = formatProtocolExport(projectForProtocol);
          break;
        }

        case 'coordinates': {
          console.log('Preparing coordinates export...');
          const project = data.projects[projectId];
          if (!project) {
            throw new Error(`Projekt s ID ${projectId} nebyl nalezen`);
          }
          const projectForCoordinates = validateProject(project);
          exportContent = formatCoordinatesExport(projectForCoordinates);
          break;
        }

        default:
          throw new Error(`Neplatný typ exportu: ${exportType}`);
      }

      const dateString = formatDate();
      const filePath = `${RNFS.DownloadDirectoryPath}/GNSSapp${exportType}${dateString}.txt`;
      
      console.log('Writing to file:', filePath);
      await RNFS.writeFile(filePath, exportContent, 'utf8');
      console.log('File saved successfully');

      SoundPlayer.playAsset(require('../Sounds/export_success.mp3'));

    } catch (error) {
      console.error('Export failed:', error);
      SoundPlayer.playAsset(require('../Sounds/failure.mp3'));
      throw error;
    }
  };

  return { handleExport };
};