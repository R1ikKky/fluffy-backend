import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";


@Injectable()
export class ContactsApiService{
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

    list(userId: string) {
        return firstValueFrom(
            this.httpService.get(`${this.url}/contacts/get-all`, { headers: this.headers(userId) })
        ).then(res => res.data)
    }

    add(userId: string, peerId: string) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/contacts/add-one`, { peerId }, { headers: this.headers(userId) }),
        ).then(res => res.data);
    }

    remove(userId: string, peerId: string) {
        return firstValueFrom(
            this.httpService.delete(`${this.url}/contacts/delete-one`, { data: { peerId } , headers: this.headers(userId) })
        ).then(res => res.data)
    }
}