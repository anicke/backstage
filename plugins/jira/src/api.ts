import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import type { JiraResponse } from './types';
import { PROJECT_KEY_ANNOTATION } from './annotations';

export interface JiraApi {
  getProjectAvatar(entityRef: string): any;
  getJiraResponseByEntity(
    entityRef: string,
    projectKey: string,
  ): Promise<JiraResponse>;
}

export const isJiraAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[PROJECT_KEY_ANNOTATION]);

export const jiraApiRef = createApiRef<JiraApi>({
  id: 'jira',
});

export class JiraClient implements JiraApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getJiraResponseByEntity(
    entityRef: string,
    projectKey: string,
  ): Promise<JiraResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('jira');

    const data = await this.fetchApi.fetch(
      `${baseUrl}/${encodeURIComponent(entityRef)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (data.ok) return data.json();
    if (data.status === 404) {
      throw Error(`No Jira project found for project key ${projectKey}`);
    }
    throw new Error(`Failed to get data from Jira`);
  }

  async getProjectAvatar(entityRef: string): Promise<string> {
    const baseUrl = await this.discoveryApi.getBaseUrl('jira');

    return `${baseUrl}/avatar/${encodeURIComponent(entityRef)}`;
  }
}
