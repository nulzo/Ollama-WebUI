import urlJoin from 'url-join';
import pkg from 'package.json';


export const GITHUB: string             = pkg.github;
export const ISSUES: string             = urlJoin(GITHUB, 'issues/new/choose');
export const CHANGELOG: string          = urlJoin(GITHUB, 'blob/main/CHANGELOG.md');
export const IMAGE: string              = 'https://hub.docker.com/r/nulzo/ollama-webui';
export const DOCUMENTS: string          = urlJoin(GITHUB, '/docs');
export const USAGE_DOCUMENTS: string    = urlJoin(DOCUMENTS, '/usage');
export const HOSTING_DOCUMENTS: string  = urlJoin(DOCUMENTS, '/hosting');
export const DATABASE_DOCUMENTS: string = urlJoin(DOCUMENTS, '/database');
export const PRIVACY_URL: string        = urlJoin(DOCUMENTS, '/privacy');
export const RELEASES_URL: string       = urlJoin(GITHUB, 'releases');
