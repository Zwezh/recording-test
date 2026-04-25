import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { VideoListItem } from '../../models/recorder.models';

@Component({
  selector: 'app-video-player-dialog',
  templateUrl: './video-player-dialog.component.html',
  styleUrl: './video-player-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerDialogComponent {
  readonly video = input.required<VideoListItem>();
  readonly closed = output<void>();

  private readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');

  protected readonly isPlaying = signal(true);
  protected readonly currentTime = signal(0);
  protected readonly duration = signal(0);
  protected readonly progress = computed(() => {
    const duration = this.duration();
    return duration === 0 ? 0 : (this.currentTime() / duration) * 100;
  });

  protected async togglePlayback(): Promise<void> {
    const player = this.videoElement()?.nativeElement;

    if (!player) {
      return;
    }

    if (player.paused) {
      await player.play();
      return;
    }

    player.pause();
  }

  protected seek(event: Event): void {
    const player = this.videoElement()?.nativeElement;
    const inputElement = event.target;

    if (!player || !(inputElement instanceof HTMLInputElement)) {
      return;
    }

    player.currentTime = Number(inputElement.value);
    this.currentTime.set(player.currentTime);
  }

  protected syncMetadata(event: Event): void {
    const player = event.target;

    if (!(player instanceof HTMLVideoElement)) {
      return;
    }

    this.duration.set(Number.isFinite(player.duration) ? player.duration : this.video().durationSeconds);
  }

  protected syncTime(event: Event): void {
    const player = event.target;

    if (!(player instanceof HTMLVideoElement)) {
      return;
    }

    this.currentTime.set(player.currentTime);
  }

  protected setPlaying(value: boolean): void {
    this.isPlaying.set(value);
  }

  protected formatTime(seconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
