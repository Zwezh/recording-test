import { Injectable } from '@angular/core';

import { VideoQuality } from '../models/recorder.models';

interface NetworkInformation {
  readonly downlink?: number;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformation;
  readonly mozConnection?: NetworkInformation;
  readonly webkitConnection?: NetworkInformation;
}

export interface BandwidthResult {
  readonly mbps: number | null;
  readonly quality: VideoQuality;
  readonly failed: boolean;
}

@Injectable({ providedIn: 'root' })
export class BandwidthService {
  detect(): BandwidthResult {
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection =
      navigatorWithConnection.connection ??
      navigatorWithConnection.mozConnection ??
      navigatorWithConnection.webkitConnection;
    const downlink = connection?.downlink;

    if (typeof downlink !== 'number' || !Number.isFinite(downlink) || downlink <= 0) {
      return { mbps: null, quality: 'medium', failed: true };
    }

    return {
      mbps: downlink,
      quality: this.qualityFromMbps(downlink),
      failed: false,
    };
  }

  qualityFromMbps(mbps: number): VideoQuality {
    if (mbps < 2) {
      return 'low';
    }

    if (mbps <= 5) {
      return 'medium';
    }

    return 'high';
  }
}
