import { useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

// Units are deployed with numbered names (K155GNSS01, K155GNSS02, ...) and the
// name is not always cased the same way, so a device counts as a candidate when
// its name contains this fragment, case-insensitively.
export const DEVICE_NAME_FRAGMENT = 'gnss';

export const isReceiverName = name =>
  typeof name === 'string' &&
  name.trim().toLowerCase().includes(DEVICE_NAME_FRAGMENT);

// NetworkManager has to associate and then wait for an address, so the answer
// to connect_wifi can take a while.
const HANDSHAKE_TIMEOUT_MS = 35000;

// hello is a local RFCOMM round trip, a candidate that does not answer in this
// long is powered off or wedged and the search moves on.
const PROBE_TIMEOUT_MS = 5000;

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
  noAnswer: 'noAnswer',
  busy: 'busy',
  tokenRequired: 'tokenRequired',
  searching: 'searching',
  connecting: 'connecting',
  waiting: 'waiting',
  done: 'done',
  failed: 'failed',
};

// The server drops a second phone with this answer instead of serving it
const isBusyAnswer = answer =>
  answer?.status === 'error' && /another phone/i.test(answer?.message ?? '');

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

  /** Every plausible receiver, already connected ones first, deduplicated by
   * address. Discovery is deliberately not used, Android cannot open a secure
   * RFCOMM socket to a device that is not bonded.
   */
  const collectCandidates = async () => {
    const sources = [
      ['connected', () => RNBluetoothClassic.getConnectedDevices()],
      ['bonded', () => RNBluetoothClassic.getBondedDevices()],
    ];

    const seen = new Set();
    const candidates = [];

    for (const [source, load] of sources) {
      let devices = [];

      try {
        devices = (await load()) ?? [];
      } catch (error) {
        console.log(`Bluetooth: ${source} list failed:`, error?.message);
        continue;
      }

      for (const device of devices) {
        if (!isReceiverName(device?.name)) {
          continue;
        }

        const key = device.address ?? device.id;

        if (!key || seen.has(key)) {
          continue;
        }

        seen.add(key);
        candidates.push(device);
        console.log(
          `Bluetooth: candidate ${device.name} (${key}) from ${source}`,
        );
      }
    }

    return candidates;
  };

  const disconnectQuietly = async device => {
    if (!device) {
      return;
    }
    try {
      await device.disconnect();
    } catch (error) {
      console.log('Bluetooth disconnect failed:', error?.message);
    }
  };

  // Reads lines off the device until one parses as the answer we want
  const readAnswer = async (device, timeoutMs) => {
    const deadline = Date.now() + timeoutMs;
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

  /** Asks one candidate who it is. hello is answered without any token check,
   * so a real receiver always replies.
   *
   * Returns 'ok' when the candidate is the receiver and stays connected,
   * 'busy' and 'token' when it answered but cannot be used, 'skip' otherwise.
   * Anything but 'ok' leaves the candidate disconnected.
   */
  const probeCandidate = async device => {
    const label = `${device?.name} (${device?.address ?? device?.id})`;

    try {
      // DELIMITER framing would swallow our own line endings, read raw instead
      if (!(await device.isConnected())) {
        await device.connect({ delimiter: '' });
      }

      await device.write(JSON.stringify({ command: 'hello' }) + LINE_END);

      const answer = await readAnswer(device, PROBE_TIMEOUT_MS);

      if (!answer) {
        console.log(`Bluetooth: ${label} rejected, no answer to hello`);
        await disconnectQuietly(device);
        return { result: 'skip' };
      }

      if (isBusyAnswer(answer)) {
        console.log(`Bluetooth: ${label} busy, another phone is connected`);
        await disconnectQuietly(device);
        return { result: 'busy' };
      }

      if (answer.status !== 'ok' || !isReceiverName(answer.device)) {
        console.log(
          `Bluetooth: ${label} rejected, unexpected hello answer`,
          JSON.stringify(answer),
        );
        await disconnectQuietly(device);
        return { result: 'skip' };
      }

      if (answer.token_required) {
        console.log(`Bluetooth: ${label} wants a token, this build has none`);
        await disconnectQuietly(device);
        return { result: 'token' };
      }

      console.log(`Bluetooth: ${label} answered hello as ${answer.device}`);
      return { result: 'ok', hello: answer };
    } catch (error) {
      console.log(`Bluetooth: ${label} rejected,`, error?.message);
      await disconnectQuietly(device);
      return { result: 'skip' };
    }
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

      setState(HANDSHAKE_STATE.searching);
      setMessage(null);

      const candidates = await collectCandidates();

      if (candidates.length === 0) {
        console.log('Bluetooth: no bonded or connected candidate');
        setState(HANDSHAKE_STATE.notPaired);
        return null;
      }

      setState(HANDSHAKE_STATE.connecting);

      // The first candidate that answers the protocol is the receiver, a stale
      // bond to a dead unit is skipped here instead of failing the handshake.
      for (const candidate of candidates) {
        const probe = await probeCandidate(candidate);

        if (probe.result === 'ok') {
          device = candidate;
          break;
        }

        if (probe.result === 'busy') {
          setState(HANDSHAKE_STATE.busy);
          return null;
        }

        if (probe.result === 'token') {
          setState(HANDSHAKE_STATE.tokenRequired);
          return null;
        }
      }

      if (!device) {
        console.log(
          `Bluetooth: ${candidates.length} candidate(s), none answered hello`,
        );
        setState(HANDSHAKE_STATE.noAnswer);
        return null;
      }

      setState(HANDSHAKE_STATE.waiting);

      await device.write(
        JSON.stringify({ command: 'connect_wifi', ssid, password }) + LINE_END,
      );

      const answer = await readAnswer(device, HANDSHAKE_TIMEOUT_MS);

      if (!answer) {
        setState(HANDSHAKE_STATE.failed);
        setMessage('Přijímač neodpověděl.');
        return null;
      }

      if (isBusyAnswer(answer)) {
        setState(HANDSHAKE_STATE.busy);
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
      // Rejected candidates are already closed by the probe, this is the one
      // that passed. The server serves one phone at a time, nothing may leak.
      await disconnectQuietly(device);
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
