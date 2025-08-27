import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
    provide: "REDIS",
    inject: [ConfigService],
    useFactory: (cfg: ConfigService) => {
        const url = cfg.get<string>("REDIS_URL");
        const host = cfg.get<string>("REDIS_HOST") ?? "redis";
        const port = Number(cfg.get<string>("REDIS_PORT") ?? 6379);
        const username = cfg.get<string>("REDIS_USERNAME");
        const password = cfg.get<string>("REDIS_PASSWORD");

        const client = url ? new Redis(url) : new Redis({
            host,
            port,
            username,
            password,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            retryStrategy: (times) => Math.min(times * 200, 2000),
        });

        client.on('connect', () => console.log(`[redis] connected to ${host}:${port}`));
        client.on('error', (e) => console.error('[redis] error:', e.message));

        return client;
    }
}