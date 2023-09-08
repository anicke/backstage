import { Config } from '@backstage/config';
import fetch from 'node-fetch';
import { JIRA_BASE_URL_CONFIG_PATH, JIRA_TOKEN_CONFIG_PATH } from './constants';
import type {
  Filter,
  Issue,
  Project,
  JiraIssue,
  NewJiraIssueResponse,
} from './types';

export const getProjectInfo = async (
  projectKey: string,
  config: Config,
): Promise<Project> => {
  const response = await fetch(
    `${config.getString(JIRA_BASE_URL_CONFIG_PATH)}project/${projectKey}`,
    {
      method: 'GET',
      headers: {
        Authorization: `${config.getString(JIRA_TOKEN_CONFIG_PATH)}`,
        Accept: 'application/json',
      },
    },
  );
  if (response.status != 200) {
    throw Error(`${response.status}`);
  }
  return response.json();
};

export const getFilterById = async (
  id: string,
  config: Config,
): Promise<Filter> => {
  const response = await fetch(
    `${config.getString(JIRA_BASE_URL_CONFIG_PATH)}filter/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `${config.getString(JIRA_TOKEN_CONFIG_PATH)}`,
        Accept: 'application/json',
      },
    },
  );
  if (response.status != 200) {
    throw Error(`${response.status}`);
  }
  const jsonResponse = await response.json();
  return { name: jsonResponse.name, query: jsonResponse.jql } as Filter;
};

export const getIssuesByFilter = async (
  projectKey: string,
  query: string,
  config: Config,
): Promise<Issue[]> => {
  const response = await fetch(
    `${config.getString(
      JIRA_BASE_URL_CONFIG_PATH,
    )}search?jql=project=${projectKey} AND ${query}`,
    {
      method: 'GET',
      headers: {
        Authorization: `${config.getString(JIRA_TOKEN_CONFIG_PATH)}`,
        Accept: 'application/json',
      },
    },
  ).then(resp => resp.json());
  return response.issues;
};

export const getIssuesByComponent = async (
  projectKey: string,
  componentKey: string,
  config: Config,
): Promise<Issue[]> => {
  const response = await fetch(
    `${config.getString(
      JIRA_BASE_URL_CONFIG_PATH,
    )}search?jql=project=${projectKey} AND component = "${componentKey}"`,
    {
      method: 'GET',
      headers: {
        Authorization: `${config.getString(JIRA_TOKEN_CONFIG_PATH)}`,
        Accept: 'application/json',
      },
    },
  ).then(resp => resp.json());
  return response.issues;
};

export async function getProjectAvatar(url: string, config: Config) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `${config.getString(JIRA_TOKEN_CONFIG_PATH)}`,
    },
  });
  return response;
}

export async function postNewIssue(
  jiraIssue: JiraIssue,
  config: Config,
): Promise<NewJiraIssueResponse> {
  const body = JSON.stringify({ fields: jiraIssue });
  return await fetch(`${config.getString(JIRA_BASE_URL_CONFIG_PATH)}issue`, {
    method: 'POST',
    headers: {
      Authorization: `${config.getString(JIRA_TOKEN_CONFIG_PATH)}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  }).then(response => response.json());
}

export async function addIssueWatcher(
  jira_id: string,
  user: string,
  config: Config,
): Promise<void> {
  await fetch(
    `${config.getString(JIRA_BASE_URL_CONFIG_PATH)}issue/${jira_id}/watchers`,
    {
      method: 'POST',
      headers: {
        Authorization: `${config.getString(JIRA_TOKEN_CONFIG_PATH)}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: `"${user}"`,
    },
  );
}
