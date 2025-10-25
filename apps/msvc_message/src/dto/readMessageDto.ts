import { IsUUID } from "class-validator";

export class ReadMessageDto {
    @IsUUID() chatId!: string;
    @IsUUID() messageId!: string;
}