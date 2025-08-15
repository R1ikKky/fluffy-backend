import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
    private readonly timeCost!: number;
    private readonly memoryCost!: number;
    private readonly parallelism!: number;
    private readonly hashLength!: number;
    private readonly pepper?: string;

    constructor( cfg: ConfigService ){
        this.timeCost = Number(cfg.get("ARGON_TIME_COST"))
        this.memoryCost = Number(cfg.get("ARGON_MEMORY_KB"))
        this.parallelism = Number(cfg.get("ARGON_PARALLELISM"))
        this.hashLength = Number(cfg.get("ARGON_HASH_LEN"))
        this.pepper = cfg.get<string>("PASSWORD_PEPPER")
    }

    private withPepper(plain: string): string {
        return this.pepper ? plain + this.pepper : plain;
    }

    async hash(plain: string): Promise<string> {
        const pwd = this.withPepper(plain);
        return argon2.hash(pwd, {
            type: argon2.argon2id,
            timeCost: this.timeCost,
            memoryCost: this.memoryCost,
            parallelism: this.parallelism,
            hashLength: this.hashLength,
            version: 0x13
        });
    }

    async verify(plain: string, hash: string): Promise<boolean> {
        const pwd = this.withPepper(plain);
        try{
            return await argon2.verify(hash, pwd);
        } catch {
            return false;
        }
    }

    needsRehash(hash: string): boolean {
        try{
            if (!hash.startsWith('$argon2id$')) return true;

            const m = Number(/m=(\d+)/.exec(hash)?.[1]);
            const t = Number(/t=(\d+)/.exec(hash)?.[1]);
            const p = Number(/p=(\d+)/.exec(hash)?.[1]);
            if(!Number.isFinite(m) || !Number.isFinite(t) || !Number.isFinite(p)) return true;
            return (
                t < this.timeCost   ||
                m < this.memoryCost ||
                p < this.parallelism
            );
        } catch {
            return true;
        }
    }
}
