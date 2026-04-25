import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';

import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { CameraPreviewComponent } from './components/camera-preview/camera-preview.component';
import { RecorderControlsComponent } from './components/recorder-controls/recorder-controls.component';
import { SavedVideosPanelComponent } from './components/saved-videos-panel/saved-videos-panel.component';
import { VideoPlayerDialogComponent } from './components/video-player-dialog/video-player-dialog.component';
import {
  QUALITY_OPTIONS,
  QUALITY_PROFILES,
  SavedVideo,
  VideoListItem,
  VideoQuality,
} from './models/recorder.models';
import { BandwidthService } from './services/bandwidth.service';
import { CameraService } from './services/camera.service';
import { RecordingCapture, RecordingService } from './services/recording.service';
import { VideoStorageService } from './services/video-storage.service';
import { AddVideo, DeleteVideo, SetBandwidth, SetNotice, SetQuality, SetVideos } from './state/recorder.actions';
import { RecorderState } from './state/recorder.state';

const MAX_RECORDING_SECONDS = 10;

@Component({
  selector: 'app-recorder-page',
  imports: [
    CameraPreviewComponent,
    ConfirmDialogComponent,
    RecorderControlsComponent,
    SavedVideosPanelComponent,
    VideoPlayerDialogComponent,
  ],
  templateUrl: './recorder-page.component.html',
  styleUrl: './recorder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecorderPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly bandwidthService = inject(BandwidthService);
  private readonly cameraService = inject(CameraService);
  private readonly recordingService = inject(RecordingService);
  private readonly videoStorage = inject(VideoStorageService);
  private readonly cameraPreview = viewChild(CameraPreviewComponent);

  protected readonly qualityOptions = QUALITY_OPTIONS;
  protected readonly bandwidthMbps = this.store.selectSignal(RecorderState.bandwidthMbps);
  protected readonly selectedQuality = this.store.selectSignal(RecorderState.selectedQuality);
  protected readonly manualOverride = this.store.selectSignal(RecorderState.manualOverride);
  protected readonly savedVideos = this.store.selectSignal(RecorderState.videos);
  protected readonly notice = this.store.selectSignal(RecorderState.notice);
  protected readonly recordingSeconds = signal(0);
  protected readonly isRecording = signal(false);
  protected readonly settingsOpen = signal(false);
  protected readonly pendingDelete = signal<VideoListItem | null>(null);
  protected readonly playingVideo = signal<VideoListItem | null>(null);
  protected readonly cameraError = signal<string | null>(null);
  protected readonly isCameraLoading = signal(true);
  protected readonly videoItems = computed(() =>
    this.savedVideos().map((video) => ({
      ...video,
      url: this.videoUrls.get(video.id) ?? this.createVideoUrl(video),
    })),
  );
  protected readonly selectedProfile = computed(() => QUALITY_PROFILES[this.selectedQuality()]);
  protected readonly recordingProgress = computed(
    () => (this.recordingSeconds() / MAX_RECORDING_SECONDS) * 100,
  );
  protected readonly bandwidthLabel = computed(() => {
    const mbps = this.bandwidthMbps();
    return mbps === null ? 'Bandwidth unavailable' : `${mbps.toFixed(1)} Mbps`;
  });
  protected readonly statusSuffix = computed(() => {
    if (this.settingsOpen()) {
      return 'settings';
    }

    if (this.isRecording()) {
      return 'record';
    }

    return this.videoItems().length > 0 ? 'recorded videos' : 'empty';
  });

  private mediaStream: MediaStream | null = null;
  private readonly videoUrls = new Map<string, string>();

  async ngOnInit(): Promise<void> {
    this.detectBandwidth();
    await this.loadVideos();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.startCamera();
  }

  ngOnDestroy(): void {
    this.recordingService.reset();
    this.cameraService.stop(this.mediaStream);
    for (const url of this.videoUrls.values()) {
      URL.revokeObjectURL(url);
    }
  }

  protected async chooseQuality(quality: VideoQuality): Promise<void> {
    this.store.dispatch(new SetQuality(quality, true));
    this.settingsOpen.set(false);

    if (!this.isRecording()) {
      await this.startCamera();
    }
  }

  protected toggleSettings(): void {
    this.settingsOpen.update((open) => !open);
  }

  protected async startRecording(): Promise<void> {
    if (this.isRecording()) {
      return;
    }

    if (!this.mediaStream) {
      await this.startCamera();
    }

    if (!this.mediaStream) {
      this.showCameraAlert('Camera is not available for recording.');
      return;
    }

    try {
      this.recordingService.start(this.mediaStream, this.selectedProfile(), MAX_RECORDING_SECONDS, {
        progress: (seconds) => this.recordingSeconds.set(seconds),
        stopped: (capture) => void this.finishRecording(capture),
      });
      this.isRecording.set(true);
      this.recordingSeconds.set(0);
    } catch {
      this.showCameraAlert('Recording could not be started in this browser.');
    }
  }

  protected stopRecording(): void {
    this.recordingService.stop();
  }

  protected playVideo(video: VideoListItem): void {
    this.playingVideo.set(video);
  }

  protected closePlayer(): void {
    this.playingVideo.set(null);
  }

  protected requestDelete(payload: { video: VideoListItem; event: Event }): void {
    payload.event.stopPropagation();
    this.pendingDelete.set(payload.video);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const video = this.pendingDelete();

    if (!video) {
      return;
    }

    await this.videoStorage.delete(video.id);
    this.store.dispatch(new DeleteVideo(video.id));
    const url = this.videoUrls.get(video.id);

    if (url) {
      URL.revokeObjectURL(url);
      this.videoUrls.delete(video.id);
    }

    if (this.playingVideo()?.id === video.id) {
      this.closePlayer();
    }

    this.pendingDelete.set(null);
  }

  protected dismissNotice(): void {
    this.store.dispatch(new SetNotice(null));
  }

  private detectBandwidth(): void {
    const result = this.bandwidthService.detect();
    this.store.dispatch(new SetBandwidth(result.mbps, result.failed));

    if (!this.manualOverride()) {
      this.store.dispatch(new SetQuality(result.quality, false));
    }

    if (result.failed) {
      this.store.dispatch(
        new SetNotice('Bandwidth detection is unavailable in this browser. Medium quality was selected.'),
      );
    }
  }

  private async loadVideos(): Promise<void> {
    try {
      const videos = await this.videoStorage.loadAll();
      this.store.dispatch(new SetVideos(videos));
    } catch {
      this.store.dispatch(new SetNotice('Saved videos could not be loaded from this browser.'));
    }
  }

  private async startCamera(): Promise<void> {
    this.isCameraLoading.set(true);
    this.cameraError.set(null);
    this.cameraService.stop(this.mediaStream);

    try {
      this.mediaStream = await this.cameraService.open(this.selectedProfile());
      await this.cameraPreview()?.attachStream(this.mediaStream);
    } catch {
      this.showCameraAlert('Camera permission was denied or the webcam is not accessible.');
    } finally {
      this.isCameraLoading.set(false);
    }
  }

  private async finishRecording(capture: RecordingCapture | null): Promise<void> {
    this.isRecording.set(false);

    if (!capture) {
      return;
    }

    const video: SavedVideo = {
      id: crypto.randomUUID(),
      blob: capture.blob,
      mimeType: capture.mimeType,
      createdAt: new Date().toISOString(),
      durationSeconds: capture.durationSeconds,
      quality: this.selectedQuality(),
    };

    try {
      await this.videoStorage.save(video);
      this.store.dispatch(new AddVideo(video));
    } catch {
      this.store.dispatch(new SetNotice('This recording could not be saved in browser storage.'));
    }
  }

  private showCameraAlert(message: string): void {
    this.cameraError.set(message);
    this.store.dispatch(new SetNotice(message));
    window.alert(message);
  }

  private createVideoUrl(video: SavedVideo): string {
    const url = URL.createObjectURL(video.blob);
    this.videoUrls.set(video.id, url);
    return url;
  }
}
