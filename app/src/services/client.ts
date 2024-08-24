import { api_version, database_endpoint, database_port } from '@/const/utils';
import { FetchWrapper } from '@/services/fetch';
import { SettingsService } from '@/services/settings';
import { FetchConfig, Fetch } from '@/types/fetch';

const fetchConfig: FetchConfig = { host: database_endpoint, port: database_port, endpoint: `/api/${api_version}` };
const fetch: Fetch = window.fetch;
const fetchWrapper: FetchWrapper = new FetchWrapper(fetchConfig);

const settingsService = new SettingsService(fetchWrapper, fetch);

export { settingsService };
