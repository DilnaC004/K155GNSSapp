// Formatting shared by the screens that talk to the receiver server.

export const formatBytes = bytes => {
  if (bytes == null) {
    return '-';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} kB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDuration = seconds => {
  if (seconds == null || isNaN(seconds)) {
    return '00:00:00';
  }
  const whole = Math.max(0, Math.floor(seconds));
  const hours = String(Math.floor(whole / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((whole % 3600) / 60)).padStart(2, '0');
  const rest = String(whole % 60).padStart(2, '0');
  return `${hours}:${minutes}:${rest}`;
};

// The server timestamps are nanoseconds since the epoch, milliseconds are safe
// in a JavaScript number.
export const nsToDate = ns => (ns == null ? null : new Date(ns / 1e6));

export const formatNsDate = ns => {
  const date = nsToDate(ns);
  return date ? date.toLocaleString() : '-';
};

export const locationText = location => {
  if (location === 'usb') {
    return 'USB disk';
  }
  if (location === 'local') {
    return 'paměť přijímače';
  }
  return location || '-';
};
