import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateProfileDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() about?: string;
    @IsOptional() @IsUUID() avatarId?: string;

}