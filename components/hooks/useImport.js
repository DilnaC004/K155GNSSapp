import React, { useState, useContext } from 'react';
import RNFS from 'react-native-fs';
import { DataContext } from '../Functions/DataContext';

export const useExport = () => {
    const { data } = useContext(DataContext);

    const handleImport = async (filePath) => {
        
    };
    return { handleImport }
}  