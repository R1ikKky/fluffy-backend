import { Body, Controller, Delete, Get, Param, Put, Query } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { UpdateUserDto } from "../dto/updateUserDto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("get-one/:id")
    getOne(@Param("id") id: string){
        return this.userService.getOneById(id);
    }

    @Get("get-stack")
    getMany(@Query("ids") ids?: string){
        const list = (ids ?? "").split(",").map(id => id.trim()).filter(Boolean);
        return this.userService.getManyByIds(list);
    }

    @Get("get-all")
    getAll(){
        return this.userService.getAll();
    }

    @Put("update-one/:id")
    update(@Param("id") id: string, @Body() body: UpdateUserDto){
        return this.userService.updateOne(id, body)
    }

    @Delete("delete-one/:id")
    async deleteUser(@Param("id") id: string){
        return this.userService.delete(id);
    }
}