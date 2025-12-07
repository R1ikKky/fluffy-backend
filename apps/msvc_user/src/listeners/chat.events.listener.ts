import { Controller } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class ChatEventsListener {
    constructor(private readonly usersService: UserService) {}

    @MessagePattern("user.validate.exists")
    async handleUserValidation(@Payload() msg: { accountIds: string[] }) {
        const users = await this.usersService.handleUserValidation(msg.accountIds)
        return users
    }
    
}