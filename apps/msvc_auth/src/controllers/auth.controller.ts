import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { RegisterDto } from "../dto/register.dto";
import { TokensDto } from "../dto/tokens.dto";
import { LoginDto } from "../dto/login.dto";
import { RefreshDto } from "../dto/refresh.dto";

type ReqLike = { ip?: string; headers?: Record<string, string | undefined> }

@Controller()
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Post("register")
    register(@Body() dto: RegisterDto, @Req() req: ReqLike): Promise<TokensDto> {
        return this.auth.register(dto, req.ip, req.headers?.["user-agent"] as string | undefined);
    }

    @Post("login")
    login(@Body() dto: LoginDto, @Req() req: ReqLike): Promise<TokensDto> {
        return this.auth.login(dto, req.ip, req.headers?.["user-agent"] as string | undefined);
    }

    @Post("refresh")
    refresh(@Body() dto: RefreshDto, @Req() req: ReqLike){
        return this.auth.refteshTokens(dto, req.ip, req.headers?.["user-agent"] as string | undefined);
    }

    @Post("logout")
    logout(@Body() dto: RefreshDto): Promise<{ ok: true }>{
        return this.auth.logout(dto)
    }
}