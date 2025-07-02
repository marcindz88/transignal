import { prepareTransignal, treeShakedTranslations, TranslationFile } from 'ngx-transignal';
import type translations from './i18n/translations';

export const transignal = prepareTransignal({
  defaultLang: 'en',
  availableLangs: ['en', 'fr'],
  translations: treeShakedTranslations<typeof translations>(),
  loader: (scope, lang): Promise<TranslationFile> =>
    import(`./i18n/${scope}/${lang}.ts`).then(res => res.default),
});
