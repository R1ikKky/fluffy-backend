import { IsOptional, IsString, IsUUID } from "class-validator";

export class AddMemberDto {
    @IsUUID() chatId!: string;
    @IsOptional() @IsString() role!: "member" | "admin";
}