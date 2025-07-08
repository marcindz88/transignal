import { Signal } from '@angular/core';

import { PluralTranslation, SelectTranslation } from './types';

export type GetNestedType<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? GetNestedType<T[Key], Rest>
    : never
  : P extends keyof T
    ? NonNullable<T[P]>
    : never;

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

export type Paths<T> = T extends object
  ? T extends Array<infer U>
    ? `${number}${'' | DotPrefix<Paths<U>>}`
    : {
        [K in keyof T]-?: K extends string | number ? `${K}${'' | DotPrefix<Paths<T[K]>>}` : never;
      }[keyof T]
  : '';

export type ArrayPaths<T> = {
  [P in Paths<T>]: GetNestedType<T, P> extends Array<unknown> ? P : never;
}[Paths<T>];

export type ObjectPaths<T> = {
  [P in Paths<T>]: GetNestedType<T, P> extends Record<any, unknown> ? P : never;
}[Paths<T>];

export type PluralPaths<T> = {
  [P in Paths<T>]: GetNestedType<T, P> extends PluralTranslation ? P : never;
}[Paths<T>];

export type SelectPaths<T> = {
  [P in Paths<T>]: GetNestedType<T, P> extends SelectTranslation ? P : never;
}[Paths<T>];

export type StringPaths<T> = {
  [P in Paths<T>]: GetNestedType<T, P> extends string ? P : never;
}[Paths<T>];

export type StringKeys<T> = Extract<keyof T, string>;

export type ResourceRefLike<T> = {
  value: Signal<T | undefined>;
  isLoading: Signal<boolean>;
  error: Signal<Error | undefined>;
};
