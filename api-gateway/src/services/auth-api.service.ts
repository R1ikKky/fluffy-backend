import { HttpService } from "@nestjs/axios";
import { Injectable, NotFoundException } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { RefreshDto } from "../dto/refresh.dto";


@Injectable()
export class AuthApiService{
    private readonly url: string;
    constructor(
        private readonly httpService: HttpService,
        // private readonly cfg: ConfigService,
    ) {
        this.url = "http://100.126.70.46:3001";
    }

    private headers(userId: string) {
        const h: Record<string, string> = {"X-User-Id": userId};
        return h;
    }

    register(userData: RegisterDto) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/auth/register`, userData)
        ).then(res => res.data)
    }

    login(userData: LoginDto) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/auth/login`, userData),
        ).then(res => res.data);
    }

    refresh(refreshToken: RefreshDto) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/auth/refresh`, refreshToken)
        ).then(res => res.data)
    }
    
    logout(refreshToken: RefreshDto) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/auth/logout`, refreshToken)
        ).then(res => res.data)
    }

    deleteOne(reqId: string, userId: string){
        if(reqId !== "6011c210-150e-4150-9bb7-ba1aced8fe97" && reqId !== "674f7bb0-e1ed-455b-b9c5-809da689ba53") throw new NotFoundException();
        return firstValueFrom(
            this.httpService.post(`${this.url}/auth/delete-one`,{} ,{ headers: this.headers(userId) })
        ).then(res => res.data)
    }
    
}