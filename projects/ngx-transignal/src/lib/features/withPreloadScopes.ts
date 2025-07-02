import { effect, inject, provideAppInitializer } from '@angular/core';
import { TransignalService } from 'ngx-transignal';

import { TransignalFeature } from './types';
import { StringKeys } from '../utility-types';

/**
 * Preloads selected scopes in default language
 * Use after language init by {@link withServerSideLanguage} or {@link withNavigatorLanguage}
 * @param scopes Scopes which should be preloaded
 */
export const withPreloadScopes = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  scopes: StringKeys<Translations>[]
): TransignalFeature<Languages, Translations> => {
  return {
    providers: [
      provideAppInitializer(() => {
        const transignalService = inject(TransignalService);
        effect(() => {
          const _activeLang = transignalService.activeLang();
          scopes.forEach(scope => transignalService.t(scope)(''));
        });
      }),
    ],
  };
};
