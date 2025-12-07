import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
    imports: [
        ClientsModule.register([
                    {
                        name: "MSVC_MESSAGE",
                        transport: Transport.RMQ,
                        options: {
                            urls: ["amqp://rick:rick@rabbitmq:5672:5672"],
                            queue: "chat.get.participants"
                        }
                    }
                ])
    ],
    providers: [],
})
export class RabbitModule {}