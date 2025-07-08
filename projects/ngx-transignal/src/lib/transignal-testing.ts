import { prepareTransignal } from './transignal-config';

/**
 * Provides unit-test version of transignal that loads translation instantly without loading
 *
 * @param transignal   existing transignal instance
 * @param translations real translations in a selected language
 */
export const provideTransignalTesting = <
  Languages extends string,
  Translations extends Record<string, Record<string, unknown>>,
>(
  transignal: ReturnType<typeof prepareTransignal<Languages, Translations>>,
  translations: Translations
) => prepareTransignal({ ...transignal.config, translations }, ...transignal.features).provide();
