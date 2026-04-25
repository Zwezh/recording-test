export type VideoQuality = 'low' | 'medium' | 'high';

export interface QualityProfile {
  readonly id: VideoQuality;
  readonly label: string;
  readonly shortLabel: string;
  readonly width: number;
  readonly height: number;
  readonly videoBitsPerSecond: number;
}

export interface SavedVideo {
  readonly id: string;
  readonly blob: Blob;
  readonly mimeType: string;
  readonly createdAt: string;
  readonly durationSeconds: number;
  readonly quality: VideoQuality;
}

export interface SavedVideoRecord {
  readonly id: string;
  readonly blob: Blob;
  readonly mimeType: string;
  readonly createdAt: string;
  readonly durationSeconds: number;
  readonly quality: VideoQuality;
}

export interface VideoListItem extends SavedVideo {
  readonly url: string;
}

export const QUALITY_PROFILES: Record<VideoQuality, QualityProfile> = {
  low: {
    id: 'low',
    label: '360p (Low Quality)',
    shortLabel: '360p',
    width: 640,
    height: 360,
    videoBitsPerSecond: 750_000,
  },
  medium: {
    id: 'medium',
    label: '720p (Medium Quality)',
    shortLabel: '720p',
    width: 1280,
    height: 720,
    videoBitsPerSecond: 2_500_000,
  },
  high: {
    id: 'high',
    label: '1080p (High Quality)',
    shortLabel: '1080p',
    width: 1920,
    height: 1080,
    videoBitsPerSecond: 5_000_000,
  },
};

export const QUALITY_OPTIONS: readonly QualityProfile[] = [
  QUALITY_PROFILES.low,
  QUALITY_PROFILES.medium,
  QUALITY_PROFILES.high,
];
