import { ArrayMaxSize, IsArray, IsUUID } from "class-validator";


export class StackDto{
    @IsArray()
    @ArrayMaxSize(200)
    @IsUUID("4",{ each: true })
    ids!: string[]
}