import { Module } from '@nestjs/common';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: async () => {
        return new Redis({
          host: 'redis',
          port: 6379,
        });
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
