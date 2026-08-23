import { useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

// The receiver advertises itself under this name once it is paired from the
// phone's Bluetooth settings.
const DEVICE_NAME = 'K155GNSS';

// NetworkManager has to associate and then wait for an address, so the answer
// to connect_wifi can take a while.
const HANDSHAKE_TIMEOUT_MS = 35000;

// Every message is one line of JSON, both ways
const LINE_END = '\n';

// What the screen shows about the handshake. Kept as a code so the wording
// stays in the component.
export const HANDSHAKE_STATE = {
  idle: 'idle',
  unsupported: 'unsupported',
  noPermission: 'noPermission',
  bluetoothOff: 'bluetoothOff',
  notPaired: 'notPaired',
  connecting: 'connecting',
  waiting: 'waiting',
  done: 'done',
  failed: 'failed',
};

function useBluetoothHandshake() {
  const [state, setState] = useState(HANDSHAKE_STATE.idle);
  const [message, setMessage] = useState(null);
  const [address, setAddress] = useState(null);
  // Guards against a second attempt while one is still waiting for the Pi
  const runningRef = useRef(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') {
      return false;
    }

    // The old BLUETOOTH permissions are install time, only the API 31 ones are
    // asked for at runtime
    if (Platform.Version < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);

    return (
      granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
      PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const findReceiver = async () => {
    const bonded = await RNBluetoothClassic.getBondedDevices();
    return bonded.find(device => device.name === DEVICE_NAME) ?? null;
  };

  // Reads lines off the device until one parses as the answer we want
  const readAnswer = async device => {
    const deadline = Date.now() + HANDSHAKE_TIMEOUT_MS;
    let buffer = '';

    while (Date.now() < deadline) {
      const chunk = await device.read();

      if (chunk) {
        buffer += chunk.toString();

        let cut = buffer.indexOf(LINE_END);
        while (cut !== -1) {
          const line = buffer.slice(0, cut).trim();
          buffer = buffer.slice(cut + 1);

          // Blank lines are keep-alives, the server ignores them too
          if (line) {
            try {
              return JSON.parse(line);
            } catch (error) {
              console.log('Bluetooth: unparsable line', line);
            }
          }

          cut = buffer.indexOf(LINE_END);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return null;
  };

  /** Hands the hotspot credentials over and returns the address the Pi got.
   *
   * Returns the connect_wifi answer on success, null otherwise. The reason for
   * a failure is left in state and message.
   */
  const handshake = async (ssid, password) => {
    if (runningRef.current) {
      return null;
    }
    if (Platform.OS !== 'android') {
      setState(HANDSHAKE_STATE.unsupported);
      return null;
    }
    if (!ssid) {
      setState(HANDSHAKE_STATE.failed);
      setMessage('Vyplň název hotspotu.');
      return null;
    }

    runningRef.current = true;
    let device = null;

    try {
      if (!(await requestPermissions())) {
        setState(HANDSHAKE_STATE.noPermission);
        return null;
      }

      if (!(await RNBluetoothClassic.isBluetoothEnabled())) {
        setState(HANDSHAKE_STATE.bluetoothOff);
        return null;
      }

      device = await findReceiver();

      if (!device) {
        setState(HANDSHAKE_STATE.notPaired);
        return null;
      }

      setState(HANDSHAKE_STATE.connecting);
      setMessage(null);

      // DELIMITER framing would swallow our own line endings, read raw instead
      if (!(await device.isConnected())) {
        await device.connect({ delimiter: '' });
      }

      setState(HANDSHAKE_STATE.waiting);

      await device.write(
        JSON.stringify({ command: 'connect_wifi', ssid, password }) + LINE_END,
      );

      const answer = await readAnswer(device);

      if (!answer) {
        setState(HANDSHAKE_STATE.failed);
        setMessage('Přijímač neodpověděl.');
        return null;
      }

      if (answer.status !== 'ok') {
        setState(HANDSHAKE_STATE.failed);
        setMessage(answer.message ?? 'Přijímač se k hotspotu nepřipojil.');
        return null;
      }

      if (!answer.ip) {
        setState(HANDSHAKE_STATE.failed);
        setMessage('Přijímač se připojil, ale nedostal adresu.');
        return null;
      }

      setState(HANDSHAKE_STATE.done);
      setAddress(answer.ip);
      setMessage(null);
      return answer;
    } catch (error) {
      console.log('Bluetooth handshake failed:', error?.message);
      setState(HANDSHAKE_STATE.failed);
      setMessage(error?.message ?? 'Spojení přes Bluetooth selhalo.');
      return null;
    } finally {
      runningRef.current = false;
      if (device) {
        try {
          await device.disconnect();
        } catch (error) {
          console.log('Bluetooth disconnect failed:', error?.message);
        }
      }
    }
  };

  return {
    state,
    message,
    address,
    handshake,
    isRunning: () => runningRef.current,
  };
}

export default useBluetoothHandshake;
