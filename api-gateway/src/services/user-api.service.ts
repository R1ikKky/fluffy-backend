import { HttpService } from "@nestjs/axios";
import { Injectable, NotFoundException } from "@nestjs/common";
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
        this.url = this.cfg.get<string>("USER_URL") || "http://100.126.70.46:3002";
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
    getManyByIds(userId: string, ids: string[]) {
        if(userId !== "6011c210-150e-4150-9bb7-ba1aced8fe97" && userId !== "674f7bb0-e1ed-455b-b9c5-809da689ba53") throw new NotFoundException();
        return firstValueFrom(
            this.httpService.post(`${this.url}/users/get-stack`, { ids })
        ).then(res => res.data)
    }
    
    getAll(userId: string) {
        if(userId !== "6011c210-150e-4150-9bb7-ba1aced8fe97" && userId !== "674f7bb0-e1ed-455b-b9c5-809da689ba53") throw new NotFoundException();
        return firstValueFrom(
            this.httpService.get(`${this.url}/users/get-all`)
        ).then(res => res.data)
    }
}