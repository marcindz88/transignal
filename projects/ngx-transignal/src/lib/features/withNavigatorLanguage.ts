import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, provideAppInitializer } from '@angular/core';

import { TransignalFeature } from './types';
import { injectTransignalConfig } from '../transignal-config';
import { TransignalService } from '../transignal-service';

/**
 * Sets active language depending on `navigator.language`, which represents user defined browser settings
 * Works only in browser environment
 */
export const withNavigatorLanguage = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(): TransignalFeature<Languages, Translations> => {
  return {
    providers: [
      provideAppInitializer(() => {
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
          const transignalService = inject(TransignalService);
          const { availableLangs } = injectTransignalConfig();
          const preferredLanguage = (
            navigator.languages.map(language => language.split('-')[0].toLowerCase()) as Languages[]
          ).find(language => availableLangs.includes(language));
          if (preferredLanguage) {
            transignalService.activeLang.set(preferredLanguage);
          }
        }
      }),
    ],
  };
};
