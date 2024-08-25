import qs from 'query-string';
import urlJoin from 'url-join';
import pkg from 'package.json';


export const NULZO_URL = 'https://nulzo.io/';
export const GITHUB = pkg.github;
export const GITHUB_ISSUES = urlJoin(GITHUB, 'issues/new/choose');
export const CHANGELOG = urlJoin(GITHUB, 'blob/main/CHANGELOG.md');
export const DOCKER_IMAGE = 'https://hub.docker.com/r/nulzo/ollama-webui';
export const DOCUMENTS = urlJoin(GITHUB, '/docs');
export const USAGE_DOCUMENTS = urlJoin(DOCUMENTS, '/usage');
export const HOSTING_DOCUMENTS = urlJoin(DOCUMENTS, '/hosting');
export const DATABASE_DOCUMENTS = urlJoin(DOCUMENTS, '/database');
export const BLOG = urlJoin(NULZO_URL, 'blog');
export const ABOUT = NULZO_URL;
export const FEEDBACK = DOCUMENTS;
export const PRIVACY_URL = urlJoin(DOCUMENTS, '/privacy');

export const SESSION_CHAT_URL = (id: string = INBOX_SESSION_ID, mobile?: boolean) =>
    qs.stringifyUrl({
        query: mobile ? { session: id, showMobileWorkspace: mobile } : { session: id },
        url: '/chat',
    });

export const imageUrl = (filename: string) => withBasePath(`/images/${filename}`);

export const LOBE_URL_IMPORT_NAME = 'settings';
export const EMAIL_SUPPORT = 'support@lobehub.com';
export const EMAIL_BUSINESS = 'hello@lobehub.com';

export const MEDIDUM = 'https://medium.com/@lobehub';
export const X = 'https://x.com/lobehub';
export const RELEASES_URL = urlJoin(GITHUB, 'releases');

export const mailTo = (email: string) => `mailto:${email}`;

export const AES_GCM_URL = 'https://datatracker.ietf.org/doc/html/draft-ietf-avt-srtp-aes-gcm-01';