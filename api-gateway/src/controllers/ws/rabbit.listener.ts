import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AmqpConnectionManager, ChannelWrapper, connect } from "amqp-connection-manager";
import { WsGateway } from "./ws.gateway";
import { ConfigService } from "@nestjs/config";
import { ConfirmChannel } from "amqplib";

@Injectable()
export class RabbitListener implements OnModuleInit, OnModuleDestroy{
    private amqp!: AmqpConnectionManager;
    private channel!: ChannelWrapper;
    private queue!: string;

    constructor(
        private readonly cfg: ConfigService,
        private readonly ws: WsGateway 
    ) {}

    async onModuleInit() {
        const url = this.cfg.get("RABBIT_URL") ?? "amqp://rick:rick@rabbit:5672";
        const pod = this.cfg.get("GATEWAY_POD_NAME") ?? `gw-${Math.random().toString().slice(2, 7)}`;


        this.amqp = connect([url]);
        this.queue = `rt-${pod}`;

        this.channel = this.amqp.createChannel({
            setup: async (ch: ConfirmChannel) => {
                await ch.assertExchange("chat.topic", "topic", { durable: true });
                await ch.assertQueue(this.queue, { durable: true, autoDelete: true });
                await ch.bindQueue(this.queue, "chat.topic", "chat.#")
                await ch.prefetch(10)

                await ch.consume(this.queue, (msg) => this.handleMessage(msg, ch), { noAck: false })
            }
        });

        console.log(`RabbitMQ is ready, queue: ${this.queue}`);
    }

    private handleMessage(msg: any, ch: ConfirmChannel) {
        try {
            const routingKey = msg?.fields.routingKey;
            const body = JSON.parse(msg.content.toString());

            const [, chatId, event] = routingKey.split('.');

            switch (event) {
                case "new":
                    this.ws.pushToChat(body.partcipants, "newMessage", body.message);
                    break;
                case "read":
                    this.ws.pushToChat(body.participants, "readMessage", body);
                    break;
                case "typing":
                    this.ws.pushToChat(body.participants, "typingMessage", body);
                    break;
                default:
                    console.log("ws-rabbit: unhandled", routingKey);
            }

            ch.ack(msg);
        } catch(err) {
            console.error("ws-rabbit: error", err);
            ch.nack(msg, false, false);
        }
    }

    async onModuleDestroy() {
        await this.channel.close();
        await this.amqp.close();
    }
}