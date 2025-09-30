import { Module } from "@nestjs/common";

@Module({
    providers: [
        {
            provide: "AMQP",
            useFactory: async () => {
                const conn = (await import("amqp-connection-manager")).connect([process.env.RABBITMQ_URL!]);
                return conn;
            }
        }
    ],
    exports: ["AMQP"],
})
export class RabbitModule {}