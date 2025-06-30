import {
  inject,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { TransignalParamService } from './transignal-param-service';
import { TransignalError, TranslationFile } from './types';
import { TransignalService } from './transignal-service';
import { StringKeys } from './utility-types';

export const TREE_SHAKED_TRANSLATIONS = Symbol('TREE_SHAKED_TRANSLATIONS');

export const treeShakedTranslations = <
  Translations extends Record<string, Record<string, unknown>>,
>() => TREE_SHAKED_TRANSLATIONS as unknown as Translations;

export type TransignalConfig<
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
> = {
  defaultLang: Languages;
  availableLangs: Languages[];
  translations: Translations;
  loader: (
    scope: StringKeys<Translations>,
    lang: Languages,
  ) => Promise<TranslationFile>;
  loadingFn?: (key: string) => string;
  paramsService?: TransignalParamService;
  errorHandler?: (errorCode: TransignalError, ...args: unknown[]) => void;
};

export const TRANSIGNAL_CONFIG = new InjectionToken('TRANSIGNAL_CONFIG');

export const injectTransignalConfig = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>() => inject<TransignalConfig<Languages, Translations>>(TRANSIGNAL_CONFIG);

export const prepareTransignal = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  config: TransignalConfig<Languages, Translations>,
) => {
  const service = () =>
    inject<
      TransignalService<Languages, Translations, StringKeys<Translations>>
    >(TransignalService);
  return {
    providers: makeEnvironmentProviders([
      { provide: TRANSIGNAL_CONFIG, useValue: config },
      TransignalService,
    ]),
    service,
    t: <Scope extends StringKeys<Translations>>(scope: Scope) =>
      service().t(scope),
  };
};
