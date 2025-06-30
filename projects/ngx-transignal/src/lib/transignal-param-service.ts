export class TransignalParamService {
  public prepareTranslation<T>(
    translation: T,
    params?: Record<string, unknown>,
  ): T {
    if (!params) {
      return translation;
    }
    return Object.entries(params).reduce(
      (prev, [key, value]) =>
        this.replaceParam(prev, key, this.paramToString(value)),
      translation,
    );
  }

  protected replaceParam<T>(translation: T, key: string, value: string): T {
    if (typeof translation === 'string') {
      return translation.replaceAll(`{{${key}}}`, value) as T;
    }
    if (Array.isArray(value)) {
      return value.map((val) => this.replaceParam(val as T, key, value)) as T;
    }
    if (typeof value === 'object') {
      return Object.entries(value).reduce(
        (prev, [objKey, objVal]) => {
          prev[objKey] = this.replaceParam(objVal, key, value);
          return prev;
        },
        {} as Record<string, unknown>,
      ) as T;
    }
    return translation;
  }

  protected paramToString(value: unknown): string {
    return (value as any).toString();
  }
}
