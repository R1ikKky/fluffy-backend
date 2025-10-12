import { Body, Controller, Delete, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ContactsApiService } from "../../services/contacts-api.service";
import { JwtGuard } from "../../guards/jwt.guard";


@UseGuards(JwtGuard)
@Controller('contacts')
export class ContactsController {
    constructor(private readonly ContactsApiService: ContactsApiService) {}

    @Get("get-all")
    list(@Req() req: any){
        const userId = req.user.id;
        return this.ContactsApiService.list(userId);
    }

    @Post("add-one")
    add(@Req() req: any, @Body() body: { peerId: string } ){
        const userId = req.user.id;
        return this.ContactsApiService.add(userId, body.peerId)
    }
    
    @Delete("delete-one")
    delete(@Req() req: any, @Body() body: { peerId: string } ){
        const userId = req.user.id;
        return this.ContactsApiService.remove(userId, body.peerId)
    }

}