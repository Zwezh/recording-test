import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { QualityProfile, VideoQuality } from '../../models/recorder.models';

@Component({
  selector: 'app-recorder-controls',
  templateUrl: './recorder-controls.component.html',
  styleUrl: './recorder-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecorderControlsComponent {
  readonly qualityOptions = input.required<readonly QualityProfile[]>();
  readonly selectedQuality = input.required<VideoQuality>();
  readonly settingsOpen = input.required<boolean>();
  readonly isRecording = input.required<boolean>();
  readonly recordingSeconds = input.required<number>();
  readonly recordingProgress = input.required<number>();

  readonly settingsToggled = output<void>();
  readonly qualitySelected = output<VideoQuality>();
  readonly recordingStarted = output<void>();
  readonly recordingStopped = output<void>();
}
