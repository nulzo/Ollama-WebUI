import { DATABASE_API_VERSION, DATABASE_ENDPOINT, DATABASE_PORT } from '@/const/database.ts';
import { FetchWrapper } from '@/services/fetch.ts';
import { SettingsService } from '@/features/settings/api/settings';
import { UserService } from '@/features/user/api/user';
import { MessageService } from '@/features/message/api/message';
import { HttpClientConfig } from '@/types/http.ts';
import { ConversationService } from '@/features/conversation/api/conversation.ts';

const fetchConfig: HttpClientConfig = {
  host: DATABASE_ENDPOINT,
  port: DATABASE_PORT,
  endpoint: `/api/${DATABASE_API_VERSION}`,
};

const fetchWrapper: FetchWrapper = new FetchWrapper(fetchConfig);

const settingsService = new SettingsService(fetchWrapper);
const userService = new UserService(fetchWrapper);
const conversationService = new ConversationService(fetchWrapper);
const messageService = new MessageService(fetchWrapper);

export { settingsService, userService, messageService, conversationService };
