import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { styles } from '../Styles/styles';
import { polarToCartesian2D } from '../Calculations/transformation';

const { height, width } = Dimensions.get('window');
const plotSize = width - 40;

const Skyplot = ({ satsVisible }) => {
  const plotCenter = plotSize / 2;
  const plotRadius = plotCenter - 20;

  return (
    <View style={styles.skyplotContainer}>
      <Text style={styles.headline}>Skyplot</Text>
      <Svg width={plotSize} height={plotSize}>
        {/* outer circle */}
        <Circle
          cx={plotCenter}
          cy={plotCenter}
          r={plotRadius}
          stroke="#000"
          strokeWidth={1}
          fill="none"
        />

        {/* inner circles to represent elevation */}
        <Circle cx={plotCenter} cy={plotCenter} r={(2 / 3) * plotRadius} stroke="#ccc" strokeWidth={1} fill="none" />
        <Circle cx={plotCenter} cy={plotCenter} r={(1 / 3) * plotRadius} stroke="#ccc" strokeWidth={1} fill="none" />

        {/* lines for directions */}
        <Line x1={plotCenter} y1={15} x2={plotCenter} y2={plotSize-15} stroke="#ccc" strokeWidth={1} />
        <Line x1={15} y1={plotCenter} x2={plotSize-15} y2={plotCenter} stroke="#ccc" strokeWidth={1} />

        {/* cardinal direction labels */}
        <SvgText x={plotCenter} y={10} fontSize="12" fill="#000" textAnchor="middle">S</SvgText>
        <SvgText x={plotCenter} y={plotSize-5} fontSize="12" fill="#000" textAnchor="middle">J</SvgText>
        <SvgText x={plotSize - 10} y={plotCenter+3} fontSize="12" fill="#000" textAnchor="middle">V</SvgText>
        <SvgText x={10} y={plotCenter+3} fontSize="12" fill="#000" textAnchor="middle">Z</SvgText>

        {/* plot satellites */}
        {satsVisible.map((satellite, index) => {
          const { x, y } = polarToCartesian2D(plotCenter, plotRadius, satellite.azimuth, satellite.elevation);
          return (
            <React.Fragment key={index}>
              <Circle cx={x} cy={y} r={5} fill={satellite.snr !== null ? 'blue' : 'red'} />
              <SvgText x={x} y={y - 10} fontSize="10" fill="#000" textAnchor="middle">
                {satellite.prn}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default Skyplot;
