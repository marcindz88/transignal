import {
  ArrayPaths,
  FilterPathsByPrefix,
  GetNestedType,
  ObjectPaths,
  StringPaths,
} from './utility-types';

export type TransignalError = 'missing_key' | 'missing_file';

export type TranslateParams = Record<string, unknown>;

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
  prefix: <T extends ObjectPaths<Context>>(
    prefix: T,
  ) => Omit<TranslateObj<Context[T]>, 'prefix'> &
    TranslateFn<FilterPathsByPrefix<StringPaths<Context>, T>, string>;
};

export type TranslationFile = Record<string, unknown>;
