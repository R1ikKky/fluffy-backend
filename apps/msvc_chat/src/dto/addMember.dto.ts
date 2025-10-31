import { IsOptional, IsString, IsUUID } from "class-validator";

export class AddMemberDto {
    @IsUUID() userId!: string;
    @IsOptional() @IsString() role?: "member" | "admin";
}