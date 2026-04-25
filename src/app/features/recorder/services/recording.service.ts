import { Injectable } from '@angular/core';

import { QualityProfile } from '../models/recorder.models';

export interface RecordingCapture {
  readonly blob: Blob;
  readonly mimeType: string;
  readonly durationSeconds: number;
}

interface RecordingHandlers {
  readonly progress: (seconds: number) => void;
  readonly stopped: (capture: RecordingCapture | null) => void;
}

@Injectable({ providedIn: 'root' })
export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private readonly recordedChunks: Blob[] = [];
  private startedAt = 0;
  private intervalId: number | null = null;
  private timeoutId: number | null = null;
  private handlers: RecordingHandlers | null = null;
  private maxSeconds = 0;
  private mimeType = '';

  start(
    stream: MediaStream,
    profile: QualityProfile,
    maxSeconds: number,
    handlers: RecordingHandlers,
  ): void {
    this.stopTimers();
    this.recordedChunks.length = 0;
    this.startedAt = Date.now();
    this.maxSeconds = maxSeconds;
    this.handlers = handlers;
    this.mimeType = this.supportedMimeType();

    const options: MediaRecorderOptions = {
      videoBitsPerSecond: profile.videoBitsPerSecond,
    };

    if (this.mimeType) {
      options.mimeType = this.mimeType;
    }

    this.mediaRecorder = new MediaRecorder(stream, options);
    this.mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    });
    this.mediaRecorder.addEventListener('stop', () => this.finish());
    this.mediaRecorder.start();

    this.intervalId = window.setInterval(() => {
      handlers.progress(this.elapsedSeconds());
    }, 100);
    this.timeoutId = window.setTimeout(() => this.stop(), maxSeconds * 1000);
  }

  stop(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return;
    }

    this.stopTimers();
    this.mediaRecorder.stop();
  }

  reset(): void {
    this.stopTimers();
    this.mediaRecorder = null;
    this.handlers = null;
    this.recordedChunks.length = 0;
  }

  private finish(): void {
    const handlers = this.handlers;
    const chunks = [...this.recordedChunks];
    const durationSeconds = this.elapsedSeconds();
    const mimeType = this.mimeType;

    this.reset();

    if (chunks.length === 0) {
      handlers?.stopped(null);
      return;
    }

    handlers?.stopped({
      blob: new Blob(chunks, { type: mimeType }),
      mimeType,
      durationSeconds,
    });
  }

  private elapsedSeconds(): number {
    const elapsed = Math.min((Date.now() - this.startedAt) / 1000, this.maxSeconds);
    return Number(elapsed.toFixed(1));
  }

  private stopTimers(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private supportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined') {
      return '';
    }

    const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

    return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? '';
  }
}
