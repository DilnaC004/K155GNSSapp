import axios from 'axios';

// The HTTP API of the receiver server lives on the same host and port as the
// WebSocket, so the address found by the UDP beacon is reused here.
const REQUEST_TIMEOUT = 10000;

// The server answers errors with { status: '<english text>' }. These are the
// ones worth showing to the user in Czech.
const statusTexts = {
  'unusable point id': 'Název bodu nelze použít jako název souboru.',
  'already recording': 'Statické měření už běží.',
  'receiver not connected': 'Přijímač není připojen k serveru.',
  'not recording': 'Žádné statické měření neběží.',
  'invalid point': 'Bod na serveru neexistuje.',
  'delete failed': 'Smazání se nezdařilo.',
  'no flash drive mounted': 'Není připojen USB disk.',
  'copy failed': 'Kopírování na USB disk se nezdařilo.',
  'cleanup failed': 'Smazání kopie na serveru se nezdařilo.',
  'already on the flash drive': 'Bod už je na USB disku.',
  'the receiver did not accept every setting':
    'Přijímač nepřijal všechna nastavení.',
  downloaded: 'Zkopírováno na USB disk.',
  deleted: 'Smazáno.',
  reconnected: 'Sériový port znovu otevřen.',
  applied: 'Nastavení odesláno do přijímače.',
};

export const translateStatus = status => statusTexts[status] || status;

export const serverErrorText = error => {
  const status = error?.response?.data?.status;
  if (status) {
    return translateStatus(status);
  }
  if (error?.message === 'Adresa serveru není známa.') {
    return error.message;
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Server neodpovídá.';
  }
  return 'Nepodařilo se spojit se serverem.';
};

function useServerApi(connectionSettings) {
  const baseUrl = connectionSettings?.hostIP
    ? `http://${connectionSettings.hostIP}:${connectionSettings.hostPort}`
    : null;

  const request = async (method, path, config = {}) => {
    if (!baseUrl) {
      throw new Error('Adresa serveru není známa.');
    }
    const response = await axios({
      method,
      url: `${baseUrl}${path}`,
      timeout: REQUEST_TIMEOUT,
      ...config,
    });
    return response.data;
  };

  // /status and /gnss/messages/apply answer 503 with a body worth showing.
  const allowUnavailable = {
    validateStatus: status => status === 200 || status === 503,
  };

  // Static measurement
  const staticStart = (pointId, antenna = {}) => {
    const params = [`point_id=${encodeURIComponent(pointId)}`];

    Object.entries({
      antenna_height: antenna.height,
      antenna_offset: antenna.offset,
      code: antenna.code,
    }).forEach(([name, value]) => {
      const text = value?.toString().trim();
      if (text) {
        params.push(`${name}=${encodeURIComponent(text)}`);
      }
    });

    return request('post', `/static/start?${params.join('&')}`);
  };
  const staticStop = () => request('post', '/static/stop');
  const staticStatus = () => request('get', '/static/status');

  // Recorded points
  const listPoints = () => request('get', '/points');
  const pointDetail = name =>
    request('get', `/points/${encodeURIComponent(name)}`);
  const deletePoint = name =>
    request('delete', `/points/${encodeURIComponent(name)}`);
  const downloadPoint = (name, cleanup = false) =>
    request(
      'post',
      `/points/${encodeURIComponent(name)}/download${cleanup ? '?cleanup=true' : ''}`,
    );

  // Storage
  const storageStatus = () => request('get', '/storage/status');
  const downloadAll = (cleanup = false) =>
    request('post', `/storage/download-all${cleanup ? '?cleanup=true' : ''}`);

  // Diagnostics
  const serverStatus = () => request('get', '/status', allowUnavailable);
  const gnssStatus = () => request('get', '/gnss/status');
  const gnssSample = (seconds = 3) =>
    request('get', `/gnss/sample?seconds=${seconds}`, {
      timeout: (seconds + 10) * 1000,
    });
  const gnssReconnect = () => request('post', '/gnss/reconnect');
  const gnssMessages = () => request('get', '/gnss/messages');
  const gnssApplyMessages = () =>
    request('post', '/gnss/messages/apply', allowUnavailable);

  return {
    baseUrl,
    hasServer: baseUrl != null,
    staticStart,
    staticStop,
    staticStatus,
    listPoints,
    pointDetail,
    deletePoint,
    downloadPoint,
    storageStatus,
    downloadAll,
    serverStatus,
    gnssStatus,
    gnssSample,
    gnssReconnect,
    gnssMessages,
    gnssApplyMessages,
  };
}

export default useServerApi;
