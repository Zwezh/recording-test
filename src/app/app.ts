import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RecorderPageComponent } from './features/recorder/recorder-page.component';

@Component({
  selector: 'app-root',
  imports: [RecorderPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
