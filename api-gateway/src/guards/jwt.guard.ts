import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fileSystem from 'fs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate{
    private readonly publicKey?: Buffer;
    private readonly sharedSecret?: string;

    constructor(private readonly cfg: ConfigService) {
        const pubPath = this.cfg.get<string>("JWT_PUBLIC")
        if (pubPath && fileSystem.existsSync(pubPath)){
            this.publicKey = fileSystem.readFileSync(pubPath);
        } else {
            this.sharedSecret = this.cfg.get<string>("JWT_SECRET") || undefined;
        }
    }

    canActivate(context: ExecutionContext): boolean {
        const req: any = context.switchToHttp().getRequest();
        const auth = (req.headers["authorization"] as string) || ""; //auth = Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6
        const AuthArray = /^Bearer\s+(.+)$/i.exec(auth); //token[1] - token
        if (!AuthArray) throw new UnauthorizedException("no bearer token");

        const token = AuthArray[1];

        try {
            const payload = this.publicKey ? (jwt.verify(token, this.publicKey, { algorithms: ["RS256"] }) as any) : (jwt.verify(token, this.sharedSecret!, { algorithms: ["HS256"] }) as any);

            if (!payload.sub) throw new Error('no sub in token');
            req.userId = { id: String(payload.sub), other: payload };
            return true;
        } catch {
            throw new UnauthorizedException("invalid token(didn't pass jwt guard)")
        }
    }

}