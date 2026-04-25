import { SavedVideo, VideoQuality } from '../models/recorder.models';

export class SetBandwidth {
  static readonly type = '[Recorder] Set Bandwidth';
  constructor(
    public readonly mbps: number | null,
    public readonly failed: boolean,
  ) {}
}

export class SetQuality {
  static readonly type = '[Recorder] Set Quality';
  constructor(
    public readonly quality: VideoQuality,
    public readonly manual: boolean,
  ) {}
}

export class SetVideos {
  static readonly type = '[Recorder] Set Videos';
  constructor(public readonly videos: readonly SavedVideo[]) {}
}

export class AddVideo {
  static readonly type = '[Recorder] Add Video';
  constructor(public readonly video: SavedVideo) {}
}

export class DeleteVideo {
  static readonly type = '[Recorder] Delete Video';
  constructor(public readonly id: string) {}
}

export class SetNotice {
  static readonly type = '[Recorder] Set Notice';
  constructor(public readonly notice: string | null) {}
}
