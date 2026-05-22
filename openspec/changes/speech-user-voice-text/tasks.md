## 1. Dependency

- [x] 1.1 Install the `openai` npm package in the `app/` workspace (`npm install openai`)

## 2. Transcribe API — Whisper integration

- [x] 2.1 In `app/app/api/transcribe/route.ts`, import `OpenAI` from the `openai` package and initialise a client using `process.env.OPENAI_API_KEY`
- [x] 2.2 Replace the stub response body with a call to `openai.audio.transcriptions.create({ model: "whisper-1", file: audio })` inside a try/catch
- [x] 2.3 Trim the result; if it is empty or whitespace, return `transcript: null`
- [x] 2.4 On any error (missing key, network, quota), catch and return `transcript: null` so the caller degrades gracefully
- [x] 2.5 Keep the existing validation logic (file presence, size, MIME-type checks) unchanged

## 3. Verification

- [x] 3.1 Manual: Record a voice message → user bubble appears with "Voice message" → shortly after, bubble updates to show the transcribed text
- [x] 3.2 Manual: With `OPENAI_API_KEY` unset or invalid → bubble stays as "Voice message", no error thrown, send still completes
