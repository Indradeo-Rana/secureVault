// A random id that stays in this browser. The backend uses it (X-Device-Id header)
// to recognise "the same device" even if the browser updates its User-Agent.
const KEY = "securevault_device_id";

export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked -> backend falls back to User-Agent based fingerprint
  }
}