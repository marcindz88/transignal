// eslint-disable-next-line unused-imports/no-unused-imports
import type { inject } from '@angular/core';

import { ParamHandler } from './transignal-param-handlers';
import {
  ArrayPaths,
  GetNestedType,
  ObjectPaths,
  PluralPaths,
  SelectPaths,
  StringKeys,
  StringPaths,
} from './utility-types';

export type TransignalError =
  /** Error when key is not found in translations */
  | 'missing_key'
  /** Error when translation file for scope and lang has not been found */
  | 'missing_file'
  /** Error plural for a value is not defined for a language */
  | 'missing_plural'
  /** Error when plural used on a non-plural translation */
  | 'invalid_plural'
  /** Error select for a value is not defined for a language */
  | 'missing_select'
  /** Error when select used on a non-select translation */
  | 'invalid_select'
  /** Error when prefix chain is called more then {@link TransignalConfig.maxPrefixDepth} */
  | 'prefix_too_deep';

export type TranslateParams = Record<string, unknown>;

export type Marked<K, T> = K & { __marker: T };

export type BasePluralTranslation = Partial<
  Record<number | 'one' | 'few' | 'many' | 'other', string>
>;

export type PluralTranslation = Marked<BasePluralTranslation, 'plural'>;

export type BaseSelectTranslation = Partial<Record<string | number | 'null', string>>;

export type MarkedAsSelect<T extends BaseSelectTranslation> = Marked<T, 'select'>;

export type SelectTranslation = MarkedAsSelect<BaseSelectTranslation>;

export type TranslateFn<Keys extends string, Result> = (
  key: Keys,
  params?: TranslateParams
) => Result;

export type TranslateObj<Context extends Record<string, any>> = TranslateFn<
  StringPaths<Context>,
  string
> & {
  /**
   * Returns translating function that returns an array of translations
   * @param key path of translation
   * @param params parameters of translation in syntax defined by {@link TransignalConfig.paramHandler}
   */
  arr: <ArrKey extends ArrayPaths<Context>>(
    key: ArrKey,
    params?: TranslateParams
  ) => GetNestedType<Context, ArrKey>;
  /**
   * Returns translating function that returns an object of translations
   * @param key path of translation
   * @param params parameters of translation in syntax defined by {@link TransignalConfig.paramHandler}
   */
  obj: <ObjKey extends ObjectPaths<Context>>(
    key: ObjKey,
    params?: TranslateParams
  ) => GetNestedType<Context, ObjKey>;
  /**
   * Returns translating function that returns a string translation depending on a correct plural form
   * @param key path of translation
   * @param count count to determine correct plural form
   * @param params parameters of translation in syntax defined by {@link TransignalConfig.paramHandler}
   */
  plural: <ObjKey extends PluralPaths<Context>>(
    key: ObjKey,
    count: number,
    params?: TranslateParams
  ) => string;
  /**
   * Returns translating function that returns a string translation depending on a selected value
   * @param key path of translation
   * @param value value to determine selected translation
   * @param params parameters of translation in syntax defined by {@link TransignalConfig.paramHandler}
   */
  select: <ObjKey extends SelectPaths<Context>>(
    key: ObjKey,
    value: keyof SelectTranslation | null,
    params?: TranslateParams
  ) => string;
  /**
   * Returns translating function that is encapsulated in a selected prefix
   * @param prefix path of new root translation
   */
  prefix: <T extends ObjectPaths<Context>>(prefix: T) => TranslateObj<GetNestedType<Context, T>>;
};

export type TranslationFile = Record<string, unknown>;

export type TransignalConfig<
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
> = {
  /**
   * Default language code
   */
  defaultLang: NoInfer<Languages>;
  /**
   * An array of available languages that your application supports.
   * These should be unique string identifiers for each language (e.g., ['en', 'fr', 'es']).
   */
  availableLangs: Languages[];
  /**
   * Defines the type of translations.
   * Please use helper function {@link treeShakedTranslations()}
   * @example
   * ```typescript
   * import type translations from './i18n/translations';
   * ...
   * translations: treeShakedTranslations<typeof translations>(),
   * ```
   */
  translations: Translations;
  /**
   * A function responsible for dynamically loading translation files.
   * This function is called when a specific translation scope and language is requested
   * It runs in TransignalService injection context so {@link inject()} can be used to e.g. use HttpClient
   *
   * @param scope The string key representing the translation scope (e.g., 'common', 'auth').
   * @param lang The language identifier for which to load translations (e.g., 'en', 'fr').
   * @returns A Promise that resolves to a `TranslationFile` object, which is
   * a record of string keys to unknown values representing the translations for
   * the given scope and language.
   */
  loader: (scope: StringKeys<Translations>, lang: Languages) => Promise<TranslationFile>;
  /**
   * An optional function that defines how a loading message should be displayed
   * while translations are being loaded.
   *
   * @param key The translation key that is currently being loaded.
   * @returns A string representing the loading message.
   */
  loadingFn?: (key: string) => string;
  /**
   * An optional function that defines how params should be processed
   * Defaults to {@link simpleParamsHandler}
   * Use {@link noParamsHandler} if you don't want to use params
   * If you want to handle message format then you can install TODO
   */
  paramHandler?: ParamHandler;
  /**
   * An optional error handler function that will be called when a `TransignalError` occurs.
   * This allows you to implement custom error reporting or logging.
   *
   * @param errorCode Code of an error {@link TransignalError} code that occurred.
   * @param args Any additional arguments relevant to the error.
   */
  errorHandler?: (errorCode: TransignalError, ...args: unknown[]) => void;
  /**
   * Defines max depth of prefix functions in {@link TranslateObj}
   * Defaults to 3, this means that if prefix function is used more than 3 time on the same t then it will fail
   * Required for performance reasons
   */
  maxPrefixDepth?: number;
};
