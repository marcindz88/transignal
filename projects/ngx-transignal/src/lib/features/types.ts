import { EnvironmentProviders } from '@angular/core';

export type TransignalFeature<
  //eslint-disable-next-line
  Languages extends string,
  //eslint-disable-next-line
  Translations extends Record<string, Record<string, unknown>>,
> = {
  providers: EnvironmentProviders[];
};
