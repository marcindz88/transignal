import { TransignalFeature } from './types';
import { inject, provideAppInitializer } from '@angular/core';
import { TransignalService } from 'ngx-transignal';
import { StringKeys } from '../utility-types';

export const withPreloadScopes = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  scopes: StringKeys<Translations>[]
): TransignalFeature<Languages, Translations> => {
  return {
    name: 'withPreloadScopes',
    providers: [
      provideAppInitializer(() => {
        const transignalService = inject(TransignalService);
        scopes.forEach(scope => transignalService.t(scope)(''));
      }),
    ],
  };
};
