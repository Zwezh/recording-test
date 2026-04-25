import { Injectable } from '@angular/core';

import { QualityProfile } from '../models/recorder.models';

@Injectable({ providedIn: 'root' })
export class CameraService {
  async open(profile: QualityProfile): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: profile.width },
        height: { ideal: profile.height },
        facingMode: 'user',
      },
    });
  }

  stop(stream: MediaStream | null): void {
    stream?.getTracks().forEach((track) => track.stop());
  }
}
