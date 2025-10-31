import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateChatDto {
    @IsString() type!: "direct" | "group";
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() avatarUrl?: string;
    @IsArray() participants!: string[];
}