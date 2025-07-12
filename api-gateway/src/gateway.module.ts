import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./controllers/ws/ws.gateway";

@Module({
    imports: [],
    controllers: [],
    providers: [WebsocketGateway]
})
export class GatewayModule {}