import {
  EnvironmentInjector,
  inject,
  Injectable,
  resource,
  ResourceRef,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core';

import { injectTransignalConfig } from './transignal-config';
import { TransignalParamService } from './transignal-param-service';
import { TranslateObj, TranslateParams, TranslationFile } from './types';
import { StringKeys, StringPaths } from './utility-types';

@Injectable()
export class TransignalService<
  Languages extends string,
  Translations extends Record<string, Record<string, any>>,
  Scopes extends StringKeys<Translations>,
> {
  private readonly injector = inject(EnvironmentInjector);
  private readonly config = injectTransignalConfig<Languages, Translations>();
  private readonly paramsService =
    this.config.paramsService ?? new TransignalParamService();

  private readonly errorHandler = this.config.errorHandler ?? console.error;

  activeLang = signal<Languages>(this.config.defaultLang);

  private scopeMap = new Map<string, TranslateObj<Translations[Scopes]>>();
  private languageMap = new Map<
    string,
    ResourceRef<TranslationFile | undefined>
  >();

  setActiveLang(lang: Languages): void {
    this.activeLang.set(
      this.config.availableLangs.find((l) => l === lang) ||
        this.config.defaultLang,
    );
  }

  t<Scope extends Scopes>(scope: Scope): TranslateObj<Translations[Scope]> {
    const existing = this.scopeMap.get(scope);
    if (existing) {
      return existing as TranslateObj<Translations[Scope]>;
    }
    const scopeObj = this.initT<Translations[Scope]>(scope);

    this.scopeMap.set(scope, scopeObj);
    return scopeObj;
  }

  private initT<Context extends Record<string, any>>(
    scope: Scopes,
  ): TranslateObj<Context> {
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
        return this.config.loadingFn?.(key) ?? '...';
      }
      if (error() || !value()) {
        this.errorHandler('missing_file', error());
        return '';
      }

      const result = this.paramsService.prepareTranslation(
        this.resolveObjectPath(value(), key),
        params,
      );
      cache.set(memoKey, result);
      return result;
    }) as TranslateObj<Context>; // needed as other props are assigned below

    t.prefix = (prefix: string) => {
      const prefixedT = (key: string, params: TranslateParams) =>
        t(`${prefix}${key}` as StringPaths<Context>, params);
      prefixedT.arr = prefixedT;
      prefixedT.obj = prefixedT;
      return prefixedT as any;
    };
    t.arr = t as any;
    t.obj = t as any;

    return t;
  }

  private fetchLanguage(
    scope: Scopes,
    lang: Languages,
  ): ResourceRef<TranslationFile | undefined> {
    const cacheKey = `${scope}/${lang}`;
    const existing = this.languageMap.get(cacheKey);
    if (existing) return existing;

    const translation = runInInjectionContext(this.injector, () =>
      untracked(() =>
        resource({ loader: () => this.config.loader(scope, lang) }),
      ),
    );
    this.languageMap.set(cacheKey, translation);
    return translation;
  }

  private resolveObjectPath(
    obj: Record<string, any> | undefined,
    path: string,
  ): unknown {
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
