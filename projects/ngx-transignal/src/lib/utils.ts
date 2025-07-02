import {
  BasePluralTranslation,
  BaseSelectTranslation,
  MarkedAsSelect,
  PluralTranslation,
} from './types';

/**
 * Utility to create a plural translation that can differ between languages and includes variants of translations for different plurals
 * Can be used with {@link TranslateObj.plural}
 * Translations may use automatic param: `{count}`
 * @param translation plural translation object
 */
export const plural = (translation: BasePluralTranslation): PluralTranslation =>
  translation as PluralTranslation;

/**
 * Utility to create a select translation
 * Can be used with {@link TranslateObj.select}
 * Translations may use automatic param: `{value}`
 * @param translation select translation object
 */
export const select = <T extends BaseSelectTranslation>(translation: T) =>
  translation as MarkedAsSelect<T>;
