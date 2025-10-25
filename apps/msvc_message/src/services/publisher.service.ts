import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AmqpConnectionManager, ChannelWrapper, connect } from "amqp-connection-manager";
import { ConfigService } from "@nestjs/config";
import { ConfirmChannel } from "amqplib";


@Injectable()
export class PublishService implements OnModuleInit, OnModuleDestroy {
    private connection!: AmqpConnectionManager;
    private channel!: ChannelWrapper;

    constructor(private readonly cfg: ConfigService) {}

    async onModuleInit() {
        this.connection = connect([this.cfg.get("RABBIT_URL") ?? "amqp://rick:rick@localhost:5672"]);
        this.channel = this.connection.createChannel({
            setup: async (ch: ConfirmChannel) => {
                await ch.assertExchange("chat.topic", "topic", { durable: true })
            }
        })
    }

    async publish(exchange: string, key: string, payload: any){
        await this.channel.publish(exchange, key, Buffer.from(JSON.stringify(payload)), {
            contentType: "application/json",
            persistent: true
        })
    }

    async getParticipants(chatId: string): Promise<string[]> {
        return ["user1", "user2"]
    }

    async onModuleDestroy() {
        await this.channel.close();
        await this.connection.close()
    }
}