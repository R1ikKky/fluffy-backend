import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { UpdateUserDto } from "../dto/updateUserDto";


@Injectable()
export class AuthApiService{
    private readonly url: string;
    constructor(
        private readonly httpService: HttpService,
        private readonly cfg: ConfigService,
    ) {
        this.url = this.cfg.get<string>("USER_URL") || "http://localhost:3001";
    }

    register(userId: string) {
        return firstValueFrom(
            this.httpService.get(`${this.url}/users/get-one`)
        ).then(res => res.data)
    }

    login(userId: string, patch: UpdateUserDto) {
        return firstValueFrom(
            this.httpService.patch(`${this.url}/users/update-one`, patch),
        ).then(res => res.data);
    }

    //больше для разработчика
    refresh(ids: string[]) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/users/get-stack`, { ids })
        ).then(res => res.data)
    }
    
    logout(ids: string[]) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/users/get-stack`, { ids })
        ).then(res => res.data)
    }
    
}