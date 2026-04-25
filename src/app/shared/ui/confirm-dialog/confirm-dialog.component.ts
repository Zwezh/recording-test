import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly cancelLabel = input('Cancel');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
