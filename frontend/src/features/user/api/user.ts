import { FetchWrapper } from "@/services/fetch.ts";
import {User} from "@/types/storage";


export class UserService {
    private _client: FetchWrapper;

    constructor(fetchWrapper: FetchWrapper) {
        this._client = fetchWrapper;
    }

    async fetchUser(_user: User) {
        const response = await this._client.get(`/user/${_user.id}`);
        return await response.json();
    }

    async storeUser(_user: User) {
        const response = await this._client.put(`/conversations/${_user.id}`, JSON.stringify(_user));
        return await response.json();
    }

    async removeUser(_user: User) {
        const response = await this._client.delete(`/conversations/${_user.id}`);
        return await response.json();
    }
}
