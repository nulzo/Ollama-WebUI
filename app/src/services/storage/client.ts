import { api_version, database_endpoint, database_port } from '@/const/utils.ts';
import { FetchWrapper } from '@/services/fetch.ts';
import { SettingsService } from '@/services/settings.ts';
import { FetchConfig, Fetch } from '@/types/fetch';
import {UserService} from "@/services/storage/user.ts";
import {ChatService} from "@/services/storage/chat.ts";
import {MessageService} from "@/services/storage/message.ts";

const fetchConfig: FetchConfig = {
    host: database_endpoint,
    port: database_port,
    endpoint: `/api/${api_version}`
};
const fetcher: Fetch = fetch;
const fetchWrapper: FetchWrapper = new FetchWrapper(fetchConfig);

const settingsService = new SettingsService(fetchWrapper, fetcher);
const userService = new UserService(fetchWrapper, fetcher);
const chatService = new ChatService(fetchWrapper, fetcher);
const messageService = new MessageService(fetchWrapper, fetcher);

export { settingsService, userService, chatService, messageService };
