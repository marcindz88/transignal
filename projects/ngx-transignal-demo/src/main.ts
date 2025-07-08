import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

// eslint-disable-next-line no-console
bootstrapApplication(App, appConfig).catch(err => console.error(err));
