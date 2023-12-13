import { useEffect } from 'react';
import { Magnetometer } from 'react-native-sensors';

const Heading = () => {
  useEffect(() => {
    const magnetometerObservable = new Magnetometer({
      updateInterval: 100, // Update interval in milliseconds
    });

    const subscription = magnetometerObservable.subscribe(({ x, y, z }) => {
      // Use the x, y, z values for your calculations or orientation
      const heading = Math.atan2(y, x) * (180 / Math.PI);
      // Update your map or other components with the heading value
      console.log('Heading:', heading);
    });

    // Cleanup on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    // Your Map component or other UI elements
  );
};

export default Heading;