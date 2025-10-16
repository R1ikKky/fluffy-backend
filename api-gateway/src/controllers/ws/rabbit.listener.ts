import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AmqpConnectionManager, ChannelWrapper, connect } from "amqp-connection-manager";
import { WsGateway } from "./ws.gateway";
import { ConfigService } from "@nestjs/config";
import { Channel, ConsumeMessage } from "amqplib";

// @Injectable()
// export class RabbitListener implements OnModuleInit, OnModuleDestroy {
//     private connection!: AmqpConnectionManager;
//     private channel!: ChannelWrapper;
//     private readonly queueName: string;
    
//     constructor(
//         private readonly wsGateway: WsGateway,
//         private readonly cfg: ConfigService
//     ) {
//         this.queueName = "rt" + (process.env.HOSTNAME || Math.random().toString(36).substring(2, 10));
//     }


//     async onModuleInit() {
//         this.connection = connect([this.cfg.get<string>("RABBIT_URL")!], {
//             reconnectTimeInSeconds: 5
//         });
//         this.channel = this.connection.createChannel({
//             json: false,
//             setup: async (ch: Channel) => {
//                 await ch.assertExchange("chat.topic", "topic", {durable:true});
//                 await ch.assertQueue(this.queueName, {durable: true});
//                 await ch.bindExchange(this.queueName, "chat.topic", "chat.#");
//                 await ch.consume(this.queueName, (msg: ConsumeMessage | null) => { if(msg) this.handleMessage(msg, ch) }, {
//                     noAck: false
//                 });
//                 console.log(`Rabbit listener ready (queue ${this.queueName})`)
//             }
//         });
//     }

//     async onModuleDestroy() {
//         await this.channel?.close();
//         await this.connection?.close();
//         console.log('Rabbit listener closed')
//     }

//     private async handleMessage(msg: ConsumeMessage, ch: Channel){
//         try{
//             const rk = msg.fields.routingKey as string;
//             const [, chatId] = rk.split(".");
//             const payload = JSON.parse(msg.content.toString());

//             const delivered = this.wsGateway.pushToChat(chatId, payload);

//             console.log(`fan-out chat ${chatId} => sent to ${delivered} sockets  (rk=${rk})`);

//             ch.ack(msg)
//         }catch(err){
//             console.log("Error in Rabbit Listener", err);
//             ch.nack(msg, false, false);
//         }
//     }
// }