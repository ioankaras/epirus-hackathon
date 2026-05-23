// Ordered by preference: best quality/compatibility first.
// iOS Safari only supports audio/mp4 (AAC).
// Firefox Android supports audio/ogg;codecs=opus.
// Chrome/Edge on Android support audio/webm;codecs=opus.
const recordingMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/wav",
];

export function getSupportedRecordingMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return (
    recordingMimeTypes.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) ?? ""
  );
}

export function getAudioFileExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a") || mimeType.includes("aac")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}
