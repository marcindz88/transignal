import {
  computed,
  EnvironmentInjector,
  inject,
  Injectable,
  resource,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core';

import { injectTransignalConfig, TREE_SHAKED_TRANSLATIONS } from './transignal-config';
import { simpleParamsHandler } from './transignal-param-handlers';
import {
  PluralTranslation,
  SelectTranslation,
  TranslateFn,
  TranslateObj,
  TranslateParams,
  TranslationFile,
} from './types';
import { ResourceRefLike, StringKeys } from './utility-types';

@Injectable()
export class TransignalService<
  Languages extends string,
  Translations extends Record<string, Record<string, any>>,
  Scopes extends StringKeys<Translations>,
> {
  private readonly injector = inject(EnvironmentInjector);
  private readonly config = injectTransignalConfig<Languages, Translations>();
  private readonly paramsHandler = this.config.paramHandler ?? simpleParamsHandler;
  private readonly loadingFn = this.config.loadingFn ?? (() => '...');
  // eslint-disable-next-line no-console
  private readonly errorHandler = this.config.errorHandler ?? console.error; // TODO maybe add a link to error page in docs
  private readonly loadingCount = signal<number>(0);
  private readonly scopeMap = new Map<string, TranslateObj<Translations[Scopes]>>();
  private readonly languageMap = new Map<string, ResourceRefLike<TranslationFile | undefined>>();

  /**
   * Use to set or get active language
   */
  readonly activeLang = signal<Languages>(this.config.defaultLang);
  /**
   * Use to determine whether service is currently loading translation files
   */
  readonly isLoading = computed(() => this.loadingCount() > 0);

  t<Scope extends Scopes>(scope: Scope): TranslateObj<Translations[Scope]> {
    const existing = this.scopeMap.get(scope);
    if (existing) {
      return existing as unknown as TranslateObj<Translations[Scope]>;
    }
    const scopeObj = this.initT<Translations[Scope]>(scope);

    this.scopeMap.set(scope, scopeObj as unknown as TranslateObj<Translations[Scopes]>);
    return scopeObj;
  }

  private initT<Context extends Record<string, any>>(scope: Scopes): TranslateObj<Context> {
    const cache = new Map<string, unknown>();
    const t: TranslateObj<Context> = ((key, params) => {
      const lang = this.activeLang();
      const baseKey = `${lang}/${key as string}`;
      const memoKey = params ? `${baseKey}_${JSON.stringify(params)}` : baseKey;
      const alreadyComputed = cache.get(memoKey);
      if (alreadyComputed) {
        return alreadyComputed;
      }
      const { isLoading, error, value } = this.fetchLanguage(scope, lang);
      if (isLoading()) {
        return this.loadingFn?.(key);
      }
      if (error() || !value()) {
        this.errorHandler('missing_file', error());
        return '';
      }

      const result = this.replaceParams(this.resolveObjectPath(value(), key), params);
      cache.set(memoKey, result);
      return result;
    }) as TranslateObj<Context>; // needed as other props are assigned below

    t.arr = t as any;
    t.obj = t as any;
    t.prefix = this.preparePrefixFn(t, 1);
    t.plural = this.preparePluralFn(t);
    t.select = this.prepareSelectFn(t);
    return t;
  }

  private preparePrefixFn(t: TranslateFn<any, any>, depth: number) {
    return (prefix: string) => {
      const prefixedT = (key: string, params?: TranslateParams) => t(`${prefix}.${key}`, params);
      prefixedT.arr = prefixedT;
      prefixedT.obj = prefixedT;
      prefixedT.plural = this.preparePluralFn(prefixedT);
      prefixedT.select = this.prepareSelectFn(prefixedT);
      prefixedT.prefix =
        this.config.maxPrefixDepth || 3 >= depth
          ? this.preparePrefixFn(prefixedT, depth + 1)
          : () => {
              this.errorHandler('prefix_too_deep');
              const t = () => '';
              t.arr = () => [];
              t.obj = () => ({});
              t.plural = () => '';
              return t;
            };
      return prefixedT as any;
    };
  }

  private preparePluralFn(t: TranslateFn<any, any>) {
    return (key: string, count: number, params?: TranslateParams) => {
      const plurals = t(key, { count, ...params }) as PluralTranslation | string;
      if (typeof plurals === 'string') {
        if (plurals === this.loadingFn(key)) {
          return plurals;
        }
        this.errorHandler('invalid_plural', key, plurals);
        return plurals as string;
      }
      if (plurals[count]) {
        return plurals[count];
      }
      const valueLastDigit = +count.toFixed(0).at(-1)!;
      if (plurals.one && valueLastDigit === 1) {
        return plurals.one;
      }
      if (plurals.many && valueLastDigit >= 5) {
        return plurals.many;
      }
      if (plurals.few && valueLastDigit > 1 && valueLastDigit < 5) {
        return plurals.few;
      }
      if (plurals.other) {
        return plurals.other;
      }
      this.errorHandler('missing_plural', key, plurals, count);
      return '';
    };
  }

  private prepareSelectFn(t: TranslateFn<any, any>) {
    return (key: string, value: string | number | null, params?: TranslateParams) => {
      const selects = t(key, { value, ...params }) as SelectTranslation | string;
      if (typeof selects === 'string') {
        if (selects === this.loadingFn(key)) {
          return selects;
        }
        this.errorHandler('invalid_select', key, selects);
        return selects as string;
      }
      if (value !== null) {
        if (selects[value]) {
          return selects[value];
        }
      } else if (selects['null']) {
        return selects['null'];
      }
      this.errorHandler('missing_select', key, selects, value);
      return '';
    };
  }

  protected replaceParams<T>(translation: T, params?: TranslateParams): T {
    if (!translation) return translation;
    if (typeof translation === 'string') {
      return this.paramsHandler(translation, params) as T;
    }
    if (Array.isArray(translation)) {
      return translation.map(val => this.replaceParams(val as T, params)) as T;
    }
    if (typeof translation === 'object') {
      return Object.entries(translation).reduce(
        (prev, [objKey, objVal]) => {
          prev[objKey] = this.replaceParams(objVal, params);
          return prev;
        },
        {} as Record<string, unknown>
      ) as T;
    }
    return translation;
  }

  private fetchLanguage(
    scope: Scopes,
    lang: Languages
  ): ResourceRefLike<TranslationFile | undefined> {
    const cacheKey = `${scope}/${lang}`;
    const existing = this.languageMap.get(cacheKey);
    if (existing) return existing;
    const { translations, loader } = this.config;

    const translation = runInInjectionContext(this.injector, () =>
      (translations as Translations | typeof TREE_SHAKED_TRANSLATIONS) === TREE_SHAKED_TRANSLATIONS
        ? untracked(() =>
            resource({
              loader: async () => {
                this.loadingCount.update(count => ++count);
                const file = await runInInjectionContext(this.injector, () => loader(scope, lang));
                this.loadingCount.update(count => --count);
                return file;
              },
            })
          )
        : {
            value: signal(translations[scope]),
            isLoading: signal(false),
            error: signal(undefined),
          }
    );
    this.languageMap.set(cacheKey, translation);
    return translation;
  }

  private resolveObjectPath(obj: Record<string, any> | undefined, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[key];
      } else {
        this.errorHandler('missing_key', { obj, path });
        return undefined;
      }
    }
    return current;
  }
}
