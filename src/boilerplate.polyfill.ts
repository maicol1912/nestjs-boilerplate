import _ from 'lodash';
import type { ObjectLiteral } from 'typeorm';
import { Brackets, SelectQueryBuilder } from 'typeorm';

import type { AbstractEntity } from './common/abstract.entity';
import type { AbstractDto } from './common/dto/abstract.dto';
import type { CreateTranslationDto } from './common/dto/create-translation.dto';
import { PageDto } from './common/dto/page.dto.ts';
import { PageMetaDto } from './common/dto/page-meta.dto.ts';
import type { PageOptionsDto } from './common/dto/page-options.dto';
import type { LanguageCode } from './constants/language-code';
import type { KeyOfType } from './types';

declare global {
  export type Uuid = string & { _uuidBrand: undefined };

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  export type Todo = unknown & { _todoBrand?: never };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Array<T> {
    toDtos<Dto extends AbstractDto>(this: T[], options?: unknown): Dto[];

    getByLanguage(
      this: CreateTranslationDto[],
      languageCode: LanguageCode,
    ): string;

    toPageDto<Dto extends AbstractDto>(
      this: T[],
      pageMetaDto: PageMetaDto,
      options?: unknown,
    ): PageDto<Dto>;
  }
}

declare module 'typeorm' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface SelectQueryBuilder<Entity> {
    searchByString(
      q: string,
      columnNames: string[],
      options?: {
        formStart: boolean;
      },
    ): this;

    paginate(
      this: SelectQueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
      options?: Partial<{ takeAll: boolean; skipCount: boolean }>,
    ): Promise<[Entity[], PageMetaDto]>;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    leftJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    leftJoin<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    innerJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    innerJoin<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;
  }
}

// eslint-disable-next-line canonical/no-use-extend-native, no-extend-native
Array.prototype.toDtos = function <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  Entity extends AbstractEntity<Dto>,
  Dto extends AbstractDto,
>(options?: unknown): Dto[] {
  return _.compact(
    _.map<Entity, Dto>(this as Entity[], (item) =>
      item.toDto(options as never),
    ),
  );
};

// eslint-disable-next-line canonical/no-use-extend-native, no-extend-native
Array.prototype.getByLanguage = function (languageCode: LanguageCode): string {
  return this.find((translation) => languageCode === translation.languageCode)!
    .text;
};

// eslint-disable-next-line canonical/no-use-extend-native, no-extend-native
Array.prototype.toPageDto = function (
  pageMetaDto: PageMetaDto,

  options?: unknown,
) {
  // eslint-disable-next-line sonarjs/argument-type
  return new PageDto(this.toDtos(options), pageMetaDto);
};

SelectQueryBuilder.prototype.searchByString = function (
  q,
  columnNames,
  options,
) {
  if (!q) {
    return this;
  }

  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} ILIKE :q`);
      }
    }),
  );

  if (options?.formStart) {
    this.setParameter('q', `${q}%`);
  } else {
    this.setParameter('q', `%${q}%`);
  }

  return this;
};

SelectQueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount: boolean;
    takeAll: boolean;
  }>,
) {
  if (!options?.takeAll) {
    this.skip(pageOptionsDto.skip).take(pageOptionsDto.take);
  }

  const entities = await this.getMany();

  let itemCount = -1;

  if (!options?.skipCount) {
    itemCount = await this.getCount();
  }

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  });

  return [entities, pageMetaDto];
};
