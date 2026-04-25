import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VideoListItem } from '../../models/recorder.models';

@Component({
  selector: 'app-saved-videos-panel',
  templateUrl: './saved-videos-panel.component.html',
  styleUrl: './saved-videos-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedVideosPanelComponent {
  readonly videos = input.required<readonly VideoListItem[]>();
  readonly bandwidthLabel = input.required<string>();
  readonly qualityLabel = input.required<string>();
  readonly manualOverride = input.required<boolean>();

  readonly videoPlayed = output<VideoListItem>();
  readonly deleteRequested = output<{ video: VideoListItem; event: Event }>();

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  }

  protected formatTime(value: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));
  }

  protected formatDuration(seconds: number): string {
    return `${Math.max(1, Math.round(seconds))}s`;
  }
}
