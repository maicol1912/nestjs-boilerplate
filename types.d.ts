declare global {
  type Uuid = string & { _uuidBrand: undefined };
  type Todo = unknown & { _todoBrand?: never };

  interface Array<T> {
    toDtos<Dto extends import('./common/dto/abstract.dto').AbstractDto>(
      this: T[],
      options?: unknown,
    ): Dto[];

    getByLanguage(
      this: import('./common/dto/create-translation.dto').CreateTranslationDto[],
      languageCode: import('./constants/language-code').LanguageCode,
    ): string;

    toPageDto<Dto extends import('./common/dto/abstract.dto').AbstractDto>(
      this: T[],
      pageMetaDto: import('./common/dto/page-meta.dto').PageMetaDto,
      options?: unknown,
    ): import('./common/dto/page.dto').PageDto<Dto>;
  }
}

// Esto asegura que TypeScript trate este archivo como un módulo
export {};
