import { IsString } from 'class-validator';

export class HandleValidationDto {
    @IsString() foundIds!: string[]
    @IsString() missingIds!: string[];
}