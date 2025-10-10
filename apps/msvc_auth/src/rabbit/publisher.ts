// import type { AmqpConnectionManager, ChannelWrapper } from "amqp-connection-manager";
// import { Channel, ConfirmChannel } from "amqplib";


// export class EventPublisher{
//     private ch: ChannelWrapper;
//     constructor(private amqp: AmqpConnectionManager, private exchange: string) {
//         this.ch = amqp.createChannel({
//             json: false,
//             setup: async (raw: Channel | ConfirmChannel) => {
//                 await raw.assertExchange(this.exchange, "topic", { durable: true });
//             }
//         })
//     }

//     publish(routingKey: string, payload: unknown) {
//         const buf = Buffer.from(JSON.stringify(payload));
//         return this.ch.publish(this.exchange, routingKey, buf, {
//             contentType: "application/json",
//             persistent: true
//         })
//     }
    
// }