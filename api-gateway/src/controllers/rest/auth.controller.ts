import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthApiService } from "../../services/auth-api.service";
import { RegisterDto } from "../../dto/register.dto";
import { LoginDto } from "../../dto/login.dto";
import { RefreshDto } from "../../dto/refresh.dto";
import { JwtGuard } from "../../guards/jwt.guard";


@Controller("auth")
export class AuthController{
    constructor(private readonly authApiService: AuthApiService) {}

    @Post("register")
    register(@Body() body: RegisterDto){
        return this.authApiService.register(body)
    }

    @Post("login")
    login(@Body() body: LoginDto){
        return this.authApiService.login(body)
    }

    @Post("refresh")
    refresh(@Body() body: RefreshDto){
        return this.authApiService.refresh(body)
    }

    @Post("logout")
    logout(@Body() body: RefreshDto){
        return this.authApiService.logout(body)
    }

    @Post("delete-one")
    @UseGuards(JwtGuard)
    deleteOne(@Req() req: any, @Body() body: {id: string} ){
        const reqId = req.user.id;
        return this.authApiService.deleteOne(reqId, body.id)
    }
}
