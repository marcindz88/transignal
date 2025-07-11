import { inject, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { TransignalFeature } from './features/types';
import { INTERNAL_TRANSIGNAL_CONFIG, TREE_SHAKED_TRANSLATIONS } from './internals';
import { TransignalService } from './transignal-service';
import { TransignalConfig } from './types';
import { StringKeys } from './utility-types';

/**
 * Utility function to define a type of translations for type inference
 */
export const treeShakedTranslations = <
  Translations extends Record<string, Record<string, unknown>>,
>() => TREE_SHAKED_TRANSLATIONS as unknown as Translations;

export const TRANSIGNAL_CONFIG = new InjectionToken('TRANSIGNAL_CONFIG');

/**
 * Use to inject transignal config
 */
export const injectTransignalConfig = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>() => inject<TransignalConfig<Languages, Translations>>(TRANSIGNAL_CONFIG);

/**
 * Prepares type-safe transignal object
 * @param config Transignal configruation {@link TransignalConfig}
 * @param features Extra tree-shakeable features
 * - {@link withPreloadScopes} - preloads selected scopes
 * - {@link withServerSideLanguage} - sets language based on `document.lang` in SSR environment
 * - {@link withNavigatorLanguage} - sets language based on `navigator.language` in browser environment
 * - {@link withLanguageLocalStorageSync} - syncs language with localStorage
 * - {@link withTranslatedTitle} - enables translation of page title
 */
export const prepareTransignal = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  config: TransignalConfig<Languages, Translations>,
  ...features: NoInfer<TransignalFeature<Languages, Translations>[]>
) => {
  const service = () =>
    inject<TransignalService<Languages, Translations, StringKeys<Translations>>>(TransignalService);
  return {
    [INTERNAL_TRANSIGNAL_CONFIG]: { config, features },
    provide: () =>
      makeEnvironmentProviders([
        { provide: TRANSIGNAL_CONFIG, useValue: config },
        TransignalService,
        features.map(feature => feature.providers),
      ]),
    service,
    t: <Scope extends StringKeys<Translations>>(scope: Scope) => service().t(scope),
  };
};
