import { Inject, Injectable, Optional } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class ServiceHealthIndicator {
  constructor(
    @Optional()
    @Inject('NATS_SERVICE')
    private readonly clientProxy?: ClientProxy,
  ) {}

  async checkHealth(eventName: string): Promise<{ [key: string]: any }> {
    try {
      if (!this.clientProxy) {
        return {
          [eventName]: {
            status: 'down',
            message: 'Client proxy not available',
          },
        };
      }

      const result = await firstValueFrom(
        this.clientProxy.send(eventName, { check: true }).pipe(timeout(10_000)),
        {
          defaultValue: undefined,
        },
      );

      if (result === undefined) {
        throw new Error('No response received from service');
      }

      return {
        [eventName]: {
          status: 'up',
          details: result,
        },
      };
    } catch (error) {
      return {
        [eventName]: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
