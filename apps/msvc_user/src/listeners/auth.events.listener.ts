import { Controller } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AccountDto } from "../dto/accountDto";


@Controller()
export class AuthEventsListener {
    constructor(private readonly usersService: UserService) {}

    @EventPattern("account.registered")
    async onAccountCreated(
        @Payload() account: AccountDto
    ) {
        this.usersService.createUser(account);
    }

    @MessagePattern({ cmd: "account.deleted" })
    async onAccountDeleted(@Payload() msg: { accountId: string }) {
        return await this.usersService.deleteUser(msg.accountId);
    }

}