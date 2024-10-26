import React, { useState, useContext } from 'react';
import RNFS from 'react-native-fs';
import { DataContext } from '../Functions/DataContext';

export const useImport = () => {
    const { data, updateData } = useContext(DataContext);
    
    const handleImport = async (file) => {
        try {
            const fileContent = await RNFS.readFile(file.fileCopyUri || file.uri, 'utf8');
            
            const lines = fileContent.trim().split('\n');
            
            let separator;
            switch (file.type) {
                case "text/csv":
                    separator = ",";
                    break;
                case "text/plain":
                default:
                    separator = /\s+/;      // handles whitespace
            }

            const newPoints = lines.map((line, index) => {
                const parts = line.trim().split(separator).map(part => part.trim());        // split parts of each line
                
                if (parts.length < 3) {
                    console.warn(`Řádek ${index + 1} přeskočen`);
                    return null;
                }

                const point = {
                    name: parts[0],
                    Y: parseFloat(parts[1]),
                    X: parseFloat(parts[2]),
                    Z: parts.length > 3 ? parseFloat(parts[3]) : null,
                    description: parts.length > 4 ? parts.slice(4).join(' ') : '',
                };

                if (!point.name || isNaN(point.Y) || isNaN(point.X)) {
                    console.warn(`Řádek ${index + 1} přeskočen: Neplatná data`);
                    return null;
                }

                return point;
            }).filter(point => point !== null);

            console.log(`Nahráno ${newPoints.length} bodů`);
            
            // updateData tady

        } catch (error) {
            console.error('Chyba ve čtení/rozklíčování souboru:', error);
            throw new Error(`Chyba při čtení souboru: ${error.message}`);
        }
    };
    return { handleImport }
}  