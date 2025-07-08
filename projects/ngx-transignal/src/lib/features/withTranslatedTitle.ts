import { computed, effect, EffectRef, inject, makeEnvironmentProviders } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Router } from 'express';

import { TransignalFeature } from './types';
import { TransignalService } from '../transignal-service';
import { TranslateObj } from '../types';
import { StringKeys } from '../utility-types';

class TransignalTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private effectRef: EffectRef | undefined;

  constructor(private readonly t: TranslateObj<Record<string, string>>) {
    super();
  }

  updateTitle(routerState: RouterStateSnapshot): void {
    this.effectRef?.destroy();
    const title = this.buildTitle(routerState);
    const translation = computed(() =>
      this.t(title || 'default', this.router.getCurrentNavigation()?.extras.state)
    );
    this.effectRef = effect(() => this.title.setTitle(translation()));
  }
}

/**
 * Enables translation of title param in route definition with use of prepared {@link TitleStrategy}
 * Automatically translates `title` param form route definition, sets website title and updates on language changes
 * Also it is possible to use parameters from `navigation.extras.state`
 *
 * @example
 * ```typescript
 * // src/app/app.routes.ts
 * export const routes = [
 *   { path: 'base', title: 'base', children: [
 *     { path: 'child', title: 'child' },
 *   ],
 *   { path: 'aux', outlet: 'popup', title: 'popupTitle' }
 * ];
 *
 * // src/app/transignal.ts
 * export const transignal = prepareTransignal(<config>, withTranslatedTitle('global'));
 *
 * // src/app/i18n/global/en.ts
 * export default {
 *   title: {
 *     base: 'Base title',
 *     child: 'Child title'
 *     popupTitle: 'Popup title'
 *   }
 * };
 * ```
 *
 * @param scope scope under which there are title translations
 * @param translationKey translation key under which there are translations, `title` by default
 */
export const withTranslatedTitle = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  scope: StringKeys<Translations>,
  translationKey = 'title'
): TransignalFeature<Languages, Translations> => {
  return {
    providers: [
      makeEnvironmentProviders([
        {
          provide: TitleStrategy,
          useFactory: (service = inject(TransignalService)) =>
            new TransignalTitleStrategy(service.t(scope).prefix(translationKey)),
        },
      ]),
    ],
  };
};
