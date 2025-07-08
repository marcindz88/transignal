import { isPlatformServer } from '@angular/common';
import { DOCUMENT, inject, PLATFORM_ID, provideAppInitializer } from '@angular/core';

import { TransignalFeature } from './types';
import { injectTransignalConfig } from '../transignal-config';
import { TransignalService } from '../transignal-service';

/**
 * Sets active language depending on `document.lang` attribute which should be set by the server.ts depending on `Accept-language` header
 * Works only in SSR environment
 */
export const withServerSideLanguage = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(): TransignalFeature<Languages, Translations> => {
  return {
    providers: [
      provideAppInitializer(() => {
        if (isPlatformServer(inject(PLATFORM_ID))) {
          const transignalService = inject(TransignalService);
          const { documentElement } = inject(DOCUMENT);
          const { availableLangs } = injectTransignalConfig();
          if (availableLangs.includes(documentElement.lang)) {
            transignalService.activeLang.set(documentElement.lang);
          }
        }
      }),
    ],
  };
};
