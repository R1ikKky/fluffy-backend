import { Controller } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { EventPattern, Payload } from "@nestjs/microservices";
import { RK_ACCOUNT_CREATED } from "../contracts/auth.events";


@Controller()
export class AuthEventsListener {
    constructor(private readonly usersService: UserService) {}

    @EventPattern(RK_ACCOUNT_CREATED)
    async onAccountCreated(
        @Payload() msg: { accountId: string, email: string; ts: string }
    ) {
            await this.usersService.ensureUserforAccount(msg.accountId, msg.email);
    }
}