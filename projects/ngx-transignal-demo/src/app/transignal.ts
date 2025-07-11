import {
  prepareTransignal,
  treeShakedTranslations,
  TranslationFile,
  withPreloadScopes,
  withNavigatorLanguage,
  withLanguageLocalStorageSync,
  withServerSideLanguage,
} from 'ngx-transignal';

import type translations from './i18n/translations';
import { withTranslatedTitle } from '../../../ngx-transignal/src/lib/features/withTranslatedTitle';

export const transignal = prepareTransignal(
  {
    defaultLang: 'en',
    availableLangs: ['en', 'fr'],
    translations: treeShakedTranslations<typeof translations>(),
    loader: (scope, lang): Promise<TranslationFile> =>
      import(`./i18n/${scope}/${lang}.ts`).then(res => res.default),
  },
  withServerSideLanguage(),
  withNavigatorLanguage(),
  withLanguageLocalStorageSync(),
  withPreloadScopes(['global']),
  withTranslatedTitle('global')
);
