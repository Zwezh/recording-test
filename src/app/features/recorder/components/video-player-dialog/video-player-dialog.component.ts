import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

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
}
