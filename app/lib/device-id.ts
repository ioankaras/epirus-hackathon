const STORAGE_KEY = "device_id";
const HEADER_NAME = "X-Device-Id";

let cachedDeviceId: string | null = null;
let originalFetch: typeof window.fetch | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  const doFetch = originalFetch ? originalFetch : window.fetch;
  const res = await doFetch("/api/register-device", { method: "POST" });
  const data = await res.json();
  const id = String(data.deviceId);
  localStorage.setItem(STORAGE_KEY, id);
  cachedDeviceId = id;
  console.log("[device-id] registered:", id);
  return id;
}

export function patchGlobalFetch() {
  if (originalFetch) return;
  originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    if (!cachedDeviceId) {
      await getDeviceId();
    }

    const headers = new Headers(init?.headers);
    if (cachedDeviceId) {
      headers.set(HEADER_NAME, cachedDeviceId);
    }

    return originalFetch!.call(this, input, { ...init, headers });
  };
}
