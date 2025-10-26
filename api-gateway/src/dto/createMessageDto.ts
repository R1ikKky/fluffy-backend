import { IsUUID, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
    @IsUUID() chatId!: string;
    @IsString() text!: string;
    @IsArray() @IsOptional() attachments?: { url: string; type: string }[];
}