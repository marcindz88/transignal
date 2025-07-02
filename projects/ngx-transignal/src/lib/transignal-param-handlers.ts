import { TranslateParams } from './types';

export type ParamHandler = (
  translation: string,
  params?: TranslateParams,
) => string;

/**
 * Param handler which allows for specification of basic params: `{name}`
 *
 * @param translation Translated text
 * @param params      Params provided to translation function
 */
export const simpleParamsHandler: ParamHandler = (translation, params) => {
  if (!params) return translation;
  for (const [key, value] of Object.entries(params)) {
    translation = translation.replaceAll(
      `{${key}}`,
      simpleParamValueStringify(value),
    );
  }
  return translation;
};

export const noParamsHandler: ParamHandler = (translation) => translation;

export const simpleParamValueStringify = (paramValue: unknown) => {
  if (typeof paramValue === 'string') {
    return paramValue;
  }
  return (paramValue as any).toString();
};
