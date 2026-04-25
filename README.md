# Bandwidth Recorder

Angular front-end assignment for checking available bandwidth, selecting webcam recording quality, recording short videos, and keeping recordings available after refresh or reopening the browser tab.

## Setup

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Open `http://localhost:4200/`.

Build for production:

```bash
npm run build
```

Run unit tests:

```bash
npm test -- --watch=false
```

## Approach

State is managed with NGXS. The recorder state stores detected bandwidth, the selected quality, whether the user manually overrode the automatic quality, UI notices, and the saved video list.

Bandwidth is detected with the browser Network Information API (`navigator.connection.downlink`) when available. The app maps the result to the assignment breakpoints:

- `< 2 Mbps`: low, 360p
- `2-5 Mbps`: medium, 720p
- `> 5 Mbps`: high, 1080p

If the browser does not expose bandwidth information, the app defaults to medium quality and shows a notice.

Recording uses `navigator.mediaDevices.getUserMedia` and `MediaRecorder`. Recordings stop automatically after 10 seconds, and the user can stop earlier. Quality changes restart the camera stream when not actively recording.

## Persistence

Recorded videos are stored as `Blob` records in IndexedDB. IndexedDB was chosen because recorded video blobs are too large and binary-heavy for `localStorage`, while object URLs are temporary and cannot survive a reload. On startup, the app reloads all saved videos from IndexedDB and creates fresh object URLs for playback.

## Error Handling

- Bandwidth detection failure: defaults to medium quality and displays a dismissible notice.
- Webcam permission or hardware failure: displays an in-app error and uses a browser alert, as requested.
- Storage failures: displays a dismissible notice.

## Assumptions and Challenges

- Browser support for `MediaRecorder` and webcam permissions varies; the app detects unsupported recording MIME types and falls back to the browser default when needed.
- The Network Information API is not supported by every browser, so defaulting to medium quality is part of the expected flow.

## Key States

- Empty recorder: live camera preview, quality settings, and empty saved-video panel.
- Recording: progress bar with elapsed seconds and stop control.
- Saved videos: scrollable persisted video list with play and delete actions.
- Playback: modal video player.
- Delete confirmation: accessible confirmation dialog before removing a recording.

## Scrinshots

Start video recorder
![ScreenShot](https://snipboard.io/B6tdJg.jpg)
Empty
![ScreenShot](https://snipboard.io/PskiO0.jpg)
Settings
![ScreenShot](https://snipboard.io/uiZNdk.jpg)
Recording
![ScreenShot](https://snipboard.io/HFvZoR.jpg)
Recorded videos
![ScreenShot](https://snipboard.io/fQE0cm.jpg)
Playing recorded videos
![ScreenShot](https://snipboard.io/VYUhlJ.jpg)
Settings
![ScreenShot](https://snipboard.io/uiZNdk.jpg)
Delete recorded video
![ScreenShot](https://snipboard.io/TuM96j.jpg)
