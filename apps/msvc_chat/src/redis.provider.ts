import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
    provide: "REDIS",
    useFactory: () => {
        const url = "redis://redis:6379"

        console.log(`[redis] connecting to ${url}`);

        const client = new Redis(url, {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            retryStrategy: (times) => Math.min(times * 200, 2000),
        })

        client.on("connect", () =>  console.log(`[redis] connected: ${url}`))
        client.on('error', (err) => console.error('[redis] error:', err.message));

        return client;
    },
}