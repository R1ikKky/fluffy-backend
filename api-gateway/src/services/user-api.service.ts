import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { UpdateUserDto } from "../dto/updateUserDto";


@Injectable()
export class UserApiService{
    private readonly url: string;
    constructor(
        private readonly httpService: HttpService,
        private readonly cfg: ConfigService,
    ) {
        this.url = this.cfg.get<string>("USER_URL") || "http://localhost:3002";
    }

    private headers(userId: string) {
        const h: Record<string, string> = {"X-User-Id": userId};
        return h;
    }

    getOne(userId: string) {
        return firstValueFrom(
            this.httpService.get(`${this.url}/users/get-one`, { headers: this.headers(userId) })
        ).then(res => res.data)
    }

    updateOne(userId: string, patch: UpdateUserDto) {
        return firstValueFrom(
            this.httpService.patch(`${this.url}/users/update-one`, patch, { headers: this.headers(userId) }),
        ).then(res => res.data);
    }

    //больше для разработчика
    getManyByIds(ids: string[]) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/users/get-stack`, { ids })
        ).then(res => res.data)
    }
    
    
}