import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthApiService } from "../../services/auth-api.service";
import { RegisterDto } from "../../dto/register.dto";
import { LoginDto } from "../../dto/login.dto";
import { RefreshDto } from "../../dto/refresh.dto";
import { JwtGuard } from "../../guards/jwt.guard";
import type { Request, Response } from 'express';


@Controller("auth")
export class AuthController{
    constructor(private readonly authApiService: AuthApiService) {}

    @Post("register")
    async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const { access, refresh } = await this.authApiService.register(body);

        res.cookie("refresh_token", refresh, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            path: "/", 
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return { access }
    }

    @Post("login")
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { access, refresh } = await this.authApiService.login(body);

        res.cookie("refresh_token", refresh, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        return { access }
    }

    @Post("refresh")
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies["refresh_token"];
        const { access, refresh } = await this.authApiService.refresh(token);

        res.cookie("refresh_token", refresh, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        return { access }
    }

    @Post("logout")
    logout(@Res({ passthrough: true }) res: Response, @Body() body: RefreshDto) {
        res.clearCookie("refresh_tocken", { path: "/" });
        return this.authApiService.logout(body);
    }

    @Post("delete-one")
    @UseGuards(JwtGuard)
    deleteOne(@Req() req: any, @Body() body: {id: string} ) {
        const reqId = req.user.id;
        return this.authApiService.deleteOne(reqId, body.id)
    }
}
