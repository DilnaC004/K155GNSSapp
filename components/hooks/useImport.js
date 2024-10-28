import React, { useState, useContext } from 'react';
import RNFS from 'react-native-fs';
import { DataContext } from '../Functions/DataContext';
import { jtsk2etrs } from '../Calculations/transformation';
import Snackbar from 'react-native-snackbar';

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
                    separator = /\s+/;
            }

            const currentProject = data.projectSettings.projectId;
            const existingTitles = new Set(data.projects[currentProject].points.map(point => point.title));
            const duplicateTitles = new Set();

            const newPoints = lines.map((line, index) => {
                const parts = line.trim().split(separator).map(part => part.trim());

                if (parts.length < 3) {
                    console.warn(`Řádek ${index + 1} přeskočen`);
                    return null;
                }

                const pointTitle = parts[0];
                const pointY = parseFloat(parts[1]);
                const pointX = parseFloat(parts[2]);
                const pointHbpv = parts.length > 3 ? parseFloat(parts[3]) : 0;

                if (!pointTitle || isNaN(pointY) || isNaN(pointX)) {
                    console.warn(`Řádek ${index + 1} přeskočen: Neplatná data`);
                    console.log(line);
                    return null;
                }

                if (existingTitles.has(pointTitle)) {
                    duplicateTitles.add(pointTitle);
                    return null;
                }

                existingTitles.add(pointTitle);

                const currentDate = new Date();

                const point = {
                    title: pointTitle,
                    b: jtsk2etrs(pointY, pointX, pointHbpv).B,
                    l: jtsk2etrs(pointY, pointX, pointHbpv).L,
                    h: jtsk2etrs(pointY, pointX, pointHbpv).H,
                    x: pointX,
                    y: pointY,
                    z: pointHbpv,
                    accuB: 0,
                    accuL: 0,
                    accuH: 0,
                    pdop: 0,
                    time: currentDate.getTime(),
                    date: currentDate.toLocaleString(),
                    height: 0,
                    offset: 0,
                    code: parts.length > 4 ? parts.slice(4).join(' ') : '',
                };

                return point;
            }).filter(point => point !== null);

            if (duplicateTitles.size > 0) {
                const duplicateList = Array.from(duplicateTitles).join(', ');
                Snackbar.show({
                    text: `Duplicitní čísla bodů: ${duplicateList}`,
                    duration: Snackbar.LENGTH_LONG,
                });
            }

            const newPointCount = newPoints.length;

            console.log(`Nahráno ${newPointCount} bodů`);

            const updatedData = data.projects.map((project, index) => {
                if (index === currentProject) {
                    const currentPointCount = project.pointCount;
                    const updatedPoints = [...project.points, ...newPoints];
                    return { ...project, points: updatedPoints, pointCount: currentPointCount + newPointCount };
                }
                return project;
            });

            updateData({
                projects: updatedData,
                projectSettings: {
                    ...data.projectSettings,
                    projectPointCount: data.projects[currentProject].points.length + newPoints.length
                }
            });

            Snackbar.show({
                text: `Úspěšně nahráno ${newPoints.length} bodů`,
                duration: Snackbar.LENGTH_LONG,
            });

        } catch (error) {
            console.error('Chyba ve čtení/rozklíčování souboru:', error);
            Snackbar.show({
                text: `Chyba při čtení souboru: ${error.message}`,
                duration: Snackbar.LENGTH_LONG,
            });
            throw error;
        }
    };

    return { handleImport }
}