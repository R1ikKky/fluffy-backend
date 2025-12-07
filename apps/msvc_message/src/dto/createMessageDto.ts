import { IsUUID, IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
    @IsUUID() @IsNotEmpty() chatId!: string;
    @IsString() @IsNotEmpty() text!: string;
    @IsArray() @IsOptional() @IsNotEmpty() attachments?: { url: string; type: string }[];
}