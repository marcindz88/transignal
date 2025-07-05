import { inject, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { TransignalFeature } from './features/types';
import { TransignalService } from './transignal-service';
import { TransignalConfig } from './types';
import { StringKeys } from './utility-types';

export const TREE_SHAKED_TRANSLATIONS = Symbol('TREE_SHAKED_TRANSLATIONS');

export const treeShakedTranslations = <
  Translations extends Record<string, Record<string, unknown>>,
>() => TREE_SHAKED_TRANSLATIONS as unknown as Translations;

export const TRANSIGNAL_CONFIG = new InjectionToken('TRANSIGNAL_CONFIG');

export const injectTransignalConfig = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>() => inject<TransignalConfig<Languages, Translations>>(TRANSIGNAL_CONFIG);

/**
 * Preparse type-safe transignal object
 * @param config Transignal configruation {@link TransignalConfig}
 * @param features Extra tree-shakeable features
 * - {@link withPreloadScopes} - preloads selected scopes
 * - {@link withServerSideLanguage} - sets language based on `document.lang` in SSR environment
 * - {@link withNavigatorLanguage} - sets language based on `navigator.language` in browser environment
 * - {@link withLanguageLocalStorageSync} - syncs language with localStorage
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
    config,
    features,
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

/**
 * Provides unit-test version of transignal that loads translation instantly without loading
 *
 * @param transignal   existing transignal instance
 * @param translations real translations in a selected language
 */
export const provideTestTransignal = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  transignal: ReturnType<typeof prepareTransignal<Languages, Translations>>,
  translations: Translations
) => prepareTransignal({ ...transignal.config, translations }, ...transignal.features).provide();
