import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { UserApiService } from "../../services/user-api.service";
import { UpdateUserDto } from "../../dto/updateUserDto";
import { JwtGuard } from "../../guards/jwt.guard";

@UseGuards(JwtGuard)
@Controller("users")
export class UserController{
    constructor(private readonly userApiService: UserApiService) {}

    @Get("get-one")
    getOne(@Req() req: any){
        const userId = req.user.id;
        return this.userApiService.getOne(userId)
    }

    @Patch("update-one")
    updateOne(@Req() req: any, @Body() body: UpdateUserDto){
        const userId = req.user.id
        return this.userApiService.updateOne(userId, body)
    }

    @Post("get-stack")
    getMany(@Req() req: any, @Body() body: { ids: string[] }){
        const userId = req.user.id;
        return this.userApiService.getManyByIds(userId, body.ids);
    }

    @Get("get-all")
    getAll(@Req() req: any){
        const userId = req.user.id;
        return this.userApiService.getAll(userId)
    }
}