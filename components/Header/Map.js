import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { SafeAreaView, View, Text, Button, PermissionsAndroid, Platform, Switch } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { styles } from '../Styles/styles';
import { DataContext } from '../Functions/DataContext';
import WebView from 'react-native-webview';
import MapScript from './MapScript';

const Map = ({ updateModalType, placingSettings, setPlacingSettings }) => {
  const { data, updateData } = useContext(DataContext);
  // No project selected means no points to draw, the screen says so below
  const project = data.projects?.[data.projectSettings.projectId];
  const point = project?.points ?? [];
  const webViewRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const updatePlacingSettings = useCallback(
    (newSettings) => {
      setPlacingSettings((prevSettings) => ({
        ...prevSettings,
        ...newSettings,
      }));
    },
    [setPlacingSettings]
  );

  const [region, setRegion] = useState({
    latitude: 49.74375000,     // 50.1042375
    longitude: 15.33863889,    // 14.3883522
    latitudeDelta: 1,
    longitudeDelta: 1,
  });

  const changeToPlacing = () => {
    updateModalType({
      point: false,
      placing: true,
      skyplot: false,
      connection: false,
      ntrip: false,
      project: false,
      map: false,
      learn: false,
      calculate: false,
      measurement: false,
    });
  };

  const handlePlacingButton = (pointID) => {
    changeToPlacing();
    updatePlacingSettings({ selectedPoint: pointID });
  };

  const fitMapbyPoints = () => {
    if (point.length > 0) {
      const latitudes = point.map((point) => point.b);
      const longitudes = point.map((point) => point.l);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const newRegion = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.abs(maxLat - minLat) + 0.5,
        longitudeDelta: Math.abs(maxLng - minLng) + 0.5,
      };
      setRegion(newRegion);
    }
  };


  useEffect(() => {
    fitMapbyPoints();
    showPoints();
  }, [point]);

  const showPoints = () => {
    const points = point.map((p, index) => `
      L.marker([${p.b}, ${p.l}])
      .addTo(map)
      .bindPopup("Bod: ${p.title}<br>Y = ${p.y.toFixed(3).replace('.', ',')} m<br>X = ${p.x.toFixed(3).replace('.', ',')} m<br>H = ${p.z.toFixed(3).replace('.', ',')} m")
      .on('click', () => window.ReactNativeWebView.postMessage(${index}));
    `).join('');
    webViewRef.current.injectJavaScript(`
      map.setView([${region.latitude}, ${region.longitude}], 7);
      ${points}
    `);
  };
  
  return (
    <View style={styles.mapContainer}>
      <View style={{...styles.buttonContainer, justifyContent: 'center'}}>
        <Button
          title={isEnabled? 'Přestaň vytyčovat' : 'Začni vytyčovat'}
          onPress={() => setIsEnabled(!isEnabled)}
        />
      </View>
      <WebView 
        ref={webViewRef}
        source={{html: MapScript}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoad={() => {
          fitMapbyPoints();
          showPoints();
        }}
        onMessage={(event) => {
          const pointIndex = parseInt(event.nativeEvent.data, 10);
          if (isEnabled) {
            handlePlacingButton(pointIndex);
          }
        }}
      />
    </View>
  );
};

export default Map;