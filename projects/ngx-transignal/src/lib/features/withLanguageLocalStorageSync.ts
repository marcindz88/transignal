import { isPlatformBrowser } from '@angular/common';
import { effect, inject, PLATFORM_ID, provideAppInitializer } from '@angular/core';
import { injectTransignalConfig, TransignalService } from 'ngx-transignal';

import { TransignalFeature } from './types';

/**
 * Saves user selected language in selected storage e.g. localStorage
 * Works only in browser environment
 * @param key Key under which it should save the language in storage
 * @param storage Storage to be used e.g. localStorage or sessionStorage
 */
export const withLanguageLocalStorageSync = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  key: string = 'LANG',
  storage: 'localStorage' | 'sessionStorage' = 'localStorage'
): TransignalFeature<Languages, Translations> => {
  return {
    providers: [
      provideAppInitializer(() => {
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
          const transignalService = inject(TransignalService);
          const store = window[storage];

          const savedLanguage = store.getItem(key);
          if (savedLanguage) {
            const { availableLangs } = injectTransignalConfig();
            if (availableLangs.includes(savedLanguage)) {
              transignalService.activeLang.set(savedLanguage);
            }
          }
          effect(() => {
            const updatedLang = transignalService.activeLang();
            store.setItem(key, updatedLang);
          });
        }
      }),
    ],
  };
};
