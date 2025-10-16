import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";


@Injectable()
export class PresenceService {
    private readonly ttl = 30;
    private readonly pod: string;

    constructor(
        @Inject("REDIS") private readonly redis: Redis,
        private readonly cfg: ConfigService
    ){
        this.pod = this.cfg.get("GATEWAY_POD_NAME") || `gw-${Math.random().toString(36).slice(2, 7)}`;
    }

    async markOnline(userId: string){
        await this.redis.setex(`online:${userId}`, this.ttl, this.pod);
    }

    async markOffline(userId: string){
        await this.redis.del(`online:${userId}`);
    }
}