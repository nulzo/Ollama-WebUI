import { FetchWrapper } from "@/services/fetch.ts";
import {User} from "@/types/storage";


export class IUserService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchUser(_user: User) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storeUser(_user: User) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeUser(_user: User) { throw new Error('Not Implemented'); }
}

export class UserService extends IUserService {
    private _client: FetchWrapper;

    constructor(fetchWrapper: FetchWrapper) {
        super();
        this._client = fetchWrapper;
    }

    async fetchUser(_user: User) {
        const response = await this._client.get('/conversations/', { _user });
        return await response.json();
    }

    async storeUser(_user: User) {
        const response = await this._client.put('/conversations/', { _user });
        return await response.json();
    }

    async removeUser(_user: User) {
        const response = await this._client.delete('/conversations/', { _user });
        return await response.json();
    }
}
