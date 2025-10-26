import { IsOptional, IsNumber } from 'class-validator';

export class GetChatMessagesDto {
    @IsNumber() @IsOptional() limit!: number;
    @IsNumber() @IsOptional() page!: number;
}