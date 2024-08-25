import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch } from "@/types/fetch";
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
    private readonly _fetch: Fetch;

    constructor(fetchWrapper: FetchWrapper, fetch: Fetch) {
        super();
        this._client = fetchWrapper;
        this._fetch = fetch;
    }

    async fetchUser(_user: User) {
        const response = await this._client.get(this._fetch, '/chats/', { _user });
        return await response.json();
    }

    async storeUser(_user: User) {
        const response = await this._client.put(this._fetch, '/chats/', { _user });
        return await response.json();
    }

    async removeUser(_user: User) {
        const response = await this._client.delete(this._fetch, '/chats/', { _user });
        return await response.json();
    }
}
