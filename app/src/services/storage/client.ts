import { DATABASE_API_VERSION, DATABASE_ENDPOINT, DATABASE_PORT } from '@/const/database.ts';
import { FetchWrapper } from '@/services/fetch.ts';
import { SettingsService } from '@/services/storage/settings.ts';
import { FetchConfig, Fetch } from '@/types/fetch';
import {UserService} from "@/services/storage/user.ts";
import {ChatService} from "@/services/storage/chat.ts";
import {MessageService} from "@/services/storage/message.ts";
import {HttpClientConfig} from "@/types/http.ts";

const fetchConfig: HttpClientConfig = {
    host: DATABASE_ENDPOINT,
    port: DATABASE_PORT,
    endpoint: `/api/${DATABASE_API_VERSION}`
};

const fetcher: Fetch = fetch;
const fetchWrapper: FetchWrapper = new FetchWrapper(fetchConfig);

const settingsService = new SettingsService(fetchWrapper);
const userService = new UserService(fetchWrapper, fetcher);
const chatService = new ChatService(fetchWrapper);
const messageService = new MessageService(fetchWrapper, fetcher);

export { settingsService, userService, chatService, messageService };
