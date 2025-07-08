import {
  computed,
  effect,
  EffectRef,
  EnvironmentInjector,
  inject,
  makeEnvironmentProviders,
  runInInjectionContext,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { TransignalFeature } from './types';
import { TransignalService } from '../transignal-service';
import { TranslateObj } from '../types';
import { StringKeys } from '../utility-types';

class TransignalTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly injector = inject(EnvironmentInjector);

  private effectRef: EffectRef | undefined;

  constructor(private readonly t: TranslateObj<Record<string, string>>) {
    super();
  }

  updateTitle(routerState: RouterStateSnapshot): void {
    this.effectRef?.destroy();
    const router = this.injector.get(Router);
    const title = this.buildTitle(routerState) || 'default';
    const translation = computed(() => this.t(title, router.getCurrentNavigation()?.extras.state));

    this.effectRef = runInInjectionContext(this.injector, () =>
      effect(() => this.title.setTitle(translation()), { manualCleanup: true })
    );
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
