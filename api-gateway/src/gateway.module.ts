import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./controllers/ws/ws.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forRoot({
        type: "postgres",
        host: "postgres",
        port: 5432,
        username: "rick",
        password: "Rick_Suncheazzz",
        database: "fluffy",
        entities: [],
        synchronize: true,
    })],
    controllers: [],
    providers: [WebsocketGateway]
})
export class GatewayModule {}