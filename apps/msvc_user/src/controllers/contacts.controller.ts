import { Body, Controller, Delete, Get, Headers, Post } from "@nestjs/common";
import { ContactsService } from "../services/contacts.service";

@Controller('contacts')
export class ContactsController {
    constructor(private readonly ContactsService: ContactsService) {}

    @Get("get-all")
    list(@Headers("X-User-Id") id: string){
        return this.ContactsService.list(id);
    }

    @Post("add-one")
    add(@Headers("X-User-Id") id: string, @Body() body: { peerId: string } ){
        return this.ContactsService.add(id, body.peerId)
    }
    
    @Delete("delete-one")
    delete(@Headers("X-User-Id") id: string, @Body() body: { peerId: string } ){
        return this.ContactsService.remove(id, body.peerId)
    }

}