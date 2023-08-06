import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

import { etrs2jtsk, jtsk2etrs} from './Calculations/transformation'


const TransformationTest = () => {
  const [etrsLat, setEtrsLat] = useState('50.000000');
  const [etrsLon, setEtrsLon] = useState('15.000000');
  const [etrsH, setEtrsH] = useState('100.000');
  const [jtskY, setJtskY] = useState('703011.8997');
  const [jtskX, setJtskX] = useState('1058147.2948');
  const [hBpv, setHBpv] = useState('55.562');
  const [jtskResult, setJtskResult] = useState({ Y: '...', X: '...', Hbpv: '...' });
  const [etrsResult, setEtrsResult] = useState({ B: '...', L: '...', H: '...' });

  const convertEtrsToJtsk = () => {
    const lat = parseFloat(etrsLat);
    const lon = parseFloat(etrsLon);
    const h = parseFloat(etrsH);

    // Perform conversion logic here
    const jtsk = etrs2jtsk(lat, lon, h);

    setJtskResult(jtsk);
  };

  const convertJtskToEtrs = () => {
    const y = parseFloat(jtskY);
    const x = parseFloat(jtskX);
    const h = parseFloat(hBpv);

    // Perform conversion logic here
    const etrs = jtsk2etrs(y, x, h);

    setEtrsResult(etrs);
  };

  return (
    <View>
      <Text>Etrs89 -&gt; S-JTSK</Text>

      <Text>Latitude [°]</Text>
      <TextInput
        value={etrsLat}
        onChangeText={setEtrsLat}
        keyboardType="numeric"
        step={0.01}
      />

      <Text>Longitude [°]</Text>
      <TextInput
        value={etrsLon}
        onChangeText={setEtrsLon}
        keyboardType="numeric"
        step={0.01}
      />

      <Text>Height elips. [m]</Text>
      <TextInput
        value={etrsH}
        onChangeText={setEtrsH}
        keyboardType="numeric"
        step={0.1}
      />

      <Button title="Convert" onPress={convertEtrsToJtsk} />

      <Text>Results</Text>
      <Text>Y-JTSK: {jtskResult.Y} m</Text>
      <Text>X-JTSK: {jtskResult.X} m</Text>
      <Text>H-Bpv: {jtskResult.Hbpv} m</Text>

      <Text>S-JTSK -&gt; ETRS89</Text>

      <Text>Y-JTSK [m]</Text>
      <TextInput
        value={jtskY}
        onChangeText={setJtskY}
        keyboardType="numeric"
        step={0.01}
      />

      <Text>X-JTSK [m]</Text>
      <TextInput
        value={jtskX}
        onChangeText={setJtskX}
        keyboardType="numeric"
        step={0.01}
      />

      <Text>H-Bpv [m]</Text>
      <TextInput
        value={hBpv}
        onChangeText={setHBpv}
        keyboardType="numeric"
        step={0.01}
      />

      <Button title="Convert" onPress={convertJtskToEtrs} />

      <Text>Results</Text>
      <Text>Latitude: {etrsResult.B} °</Text>
      <Text>Longitude: {etrsResult.L} °</Text>
      <Text>H-el: {etrsResult.H} m</Text>
    </View>
  );
};

export default TransformationTest;
