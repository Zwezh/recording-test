import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';

import { routes } from './app.routes';
import { RecorderState } from './features/recorder/state/recorder.state';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideStore([RecorderState])],
};
