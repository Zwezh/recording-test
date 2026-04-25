import { State, Action, Selector, StateContext } from '@ngxs/store';

import { SavedVideo, VideoQuality } from '../models/recorder.models';
import { AddVideo, DeleteVideo, SetBandwidth, SetNotice, SetQuality, SetVideos } from './recorder.actions';

export interface RecorderStateModel {
  readonly bandwidthMbps: number | null;
  readonly bandwidthFailed: boolean;
  readonly selectedQuality: VideoQuality;
  readonly manualOverride: boolean;
  readonly videos: readonly SavedVideo[];
  readonly notice: string | null;
}

@State<RecorderStateModel>({
  name: 'recorder',
  defaults: {
    bandwidthMbps: null,
    bandwidthFailed: false,
    selectedQuality: 'medium',
    manualOverride: false,
    videos: [],
    notice: null,
  },
})
export class RecorderState {
  @Selector()
  static bandwidthMbps(state: RecorderStateModel): number | null {
    return state.bandwidthMbps;
  }

  @Selector()
  static bandwidthFailed(state: RecorderStateModel): boolean {
    return state.bandwidthFailed;
  }

  @Selector()
  static selectedQuality(state: RecorderStateModel): VideoQuality {
    return state.selectedQuality;
  }

  @Selector()
  static manualOverride(state: RecorderStateModel): boolean {
    return state.manualOverride;
  }

  @Selector()
  static videos(state: RecorderStateModel): readonly SavedVideo[] {
    return state.videos;
  }

  @Selector()
  static notice(state: RecorderStateModel): string | null {
    return state.notice;
  }

  @Action(SetBandwidth)
  setBandwidth(ctx: StateContext<RecorderStateModel>, action: SetBandwidth): void {
    ctx.patchState({
      bandwidthMbps: action.mbps,
      bandwidthFailed: action.failed,
    });
  }

  @Action(SetQuality)
  setQuality(ctx: StateContext<RecorderStateModel>, action: SetQuality): void {
    ctx.patchState({
      selectedQuality: action.quality,
      manualOverride: action.manual,
    });
  }

  @Action(SetVideos)
  setVideos(ctx: StateContext<RecorderStateModel>, action: SetVideos): void {
    ctx.patchState({ videos: action.videos });
  }

  @Action(AddVideo)
  addVideo(ctx: StateContext<RecorderStateModel>, action: AddVideo): void {
    const state = ctx.getState();
    ctx.patchState({ videos: [action.video, ...state.videos] });
  }

  @Action(DeleteVideo)
  deleteVideo(ctx: StateContext<RecorderStateModel>, action: DeleteVideo): void {
    const state = ctx.getState();
    ctx.patchState({ videos: state.videos.filter((video) => video.id !== action.id) });
  }

  @Action(SetNotice)
  setNotice(ctx: StateContext<RecorderStateModel>, action: SetNotice): void {
    ctx.patchState({ notice: action.notice });
  }
}
