import {
  ArrayPaths,
  FilterPathsByPrefix,
  GetNestedType,
  ObjectPaths,
  PluralPaths,
  StringKeys,
  StringPaths,
} from './utility-types';
import { ParamHandler } from './transignal-param-handlers';

export type TransignalError = 'missing_key' | 'missing_file' | 'missing_plural';

export type TranslateParams = Record<string, unknown>;

export type PluralTranslation = Partial<
  Record<number | 'one' | 'few' | 'many' | 'other', string>
>;

export type TranslateFn<Keys extends string, Result> = (
  key: Keys,
  params?: TranslateParams,
) => Result;

export type TranslateObj<Context extends Record<string, any>> = TranslateFn<
  StringPaths<Context>,
  string
> & {
  arr: <ArrKey extends ArrayPaths<Context>>(
    key: ArrKey,
    params?: TranslateParams,
  ) => GetNestedType<Context, ArrKey>;
  obj: <ObjKey extends ObjectPaths<Context>>(
    key: ObjKey,
    params?: TranslateParams,
  ) => GetNestedType<Context, ObjKey>;
  plural: <ObjKey extends PluralPaths<Context>>(
    key: ObjKey,
    value: number,
    params?: TranslateParams,
  ) => string;
  prefix: <T extends ObjectPaths<Context>>(
    prefix: T,
  ) => Omit<TranslateObj<Context[T]>, 'prefix'> &
    TranslateFn<FilterPathsByPrefix<StringPaths<Context>, T>, string>;
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
   *
   * @param scope The string key representing the translation scope (e.g., 'common', 'auth').
   * @param lang The language identifier for which to load translations (e.g., 'en', 'fr').
   * @returns A Promise that resolves to a `TranslationFile` object, which is
   * a record of string keys to unknown values representing the translations for
   * the given scope and language.
   */
  loader: (
    scope: StringKeys<Translations>,
    lang: Languages,
  ) => Promise<TranslationFile>;
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
};
