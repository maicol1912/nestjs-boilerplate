import { type DynamicModule, type MiddlewareConsumer, Module } from '@nestjs/common';
import { I18nModule as BaseI18nModule } from 'nestjs-i18n'; // Importa el módulo original
import type { I18nAsyncOptions } from 'nestjs-i18n';

@Module({})
export class CustomI18nModule extends BaseI18nModule {
  static forRootAsync(options: I18nAsyncOptions): DynamicModule {
    const dynamicModule = super.forRootAsync(options);

    return {
      ...dynamicModule,
      module: CustomI18nModule,
    };
  }

  /* eslint-disable*/
  configure(consumer: MiddlewareConsumer): void {
  }
}