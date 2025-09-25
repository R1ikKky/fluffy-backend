import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ContactsService } from "../services/contacts.service";

@Controller('constacts')
export class ContactsController {
    constructor(private readonly ContactsService: ContactsService) {}

    @Get("get-all/:id")
    list(@Param("id")id: string){
        return this.ContactsService.list(id);
    }

    @Post("add-one/:id")
    add(@Param("id") id: string, @Body() body: { peerId: string } ){
        return this.ContactsService.add(id, body.peerId)
    }
    
    @Delete("delete-one/:id")
    delete(@Param("id") id: string, @Body() body: { peerId: string } ){
        return this.ContactsService.remove(id, body.peerId)
    }

}