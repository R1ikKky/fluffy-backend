import { BadRequestException, Body, Controller, Get, Headers, Patch, Post } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { UpdateUserDto } from "../dto/updateUserDto";
import { StackDto } from "../dto/stackDto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("get-one")
    async getOne(@Headers("X-User-Id") id: string){
        if (!id) throw new BadRequestException('missing x-user-id header');
        return this.userService.getOneByAccountId(id);
    }

    @Patch("update-one")
    update(@Headers("X-User-Id") id: string, @Body() body: UpdateUserDto){
        return this.userService.updateOne(id, body)
    }
    
    @Post("get-stack")
    getMany(@Body() dto: StackDto){
        const uniqueArr = Array.from(new Set(dto.ids));
        if (!uniqueArr.length) return []
        return this.userService.getManyByIds(uniqueArr);
    }

    @Get("get-all")
    getAll(){
        return this.userService.getAll();
    }

}