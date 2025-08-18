import { IsUUID } from "class-validator";

export class RefreshDto {
    @IsUUID() refresh!: string;
}