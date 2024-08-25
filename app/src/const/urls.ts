import urlJoin from 'url-join';
import pkg from 'package.json';


export const GITHUB = pkg.github;
export const ISSUES = urlJoin(GITHUB, 'issues/new/choose');
export const CHANGELOG = urlJoin(GITHUB, 'blob/main/CHANGELOG.md');
export const IMAGE = 'https://hub.docker.com/r/nulzo/ollama-webui';
export const DOCUMENTS = urlJoin(GITHUB, '/docs');
export const USAGE_DOCUMENTS = urlJoin(DOCUMENTS, '/usage');
export const HOSTING_DOCUMENTS = urlJoin(DOCUMENTS, '/hosting');
export const DATABASE_DOCUMENTS = urlJoin(DOCUMENTS, '/database');
export const PRIVACY_URL = urlJoin(DOCUMENTS, '/privacy');
export const RELEASES_URL = urlJoin(GITHUB, 'releases');
