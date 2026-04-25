import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.component.html',
  styleUrl: './camera-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CameraPreviewComponent {
  readonly isLoading = input.required<boolean>();
  readonly error = input<string | null>(null);

  private readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('cameraPreview');

  async attachStream(stream: MediaStream): Promise<void> {
    const element = this.videoElement()?.nativeElement;

    if (!element) {
      return;
    }

    element.srcObject = stream;
    await element.play();
  }
}
