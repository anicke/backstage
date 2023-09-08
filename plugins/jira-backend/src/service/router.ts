/*
 * Copyright 2022 Axis Communications
 */

import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { parseEntityRef } from '@backstage/catalog-model';
import { CatalogClient } from '@backstage/catalog-client';
import { DiscoveryApi } from '@backstage/plugin-permission-common';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { ScmIntegrations } from '@backstage/integration';
import startCase from 'lodash/startCase';
import stream from 'stream';
import type {
  Filter,
  JiraIssue,
  JiraResponse,
  PostIssueBodyType,
  Project,
} from '../types';
import {
  CacheManager,
  errorHandler,
  TokenManager,
  UrlReader,
} from '@backstage/backend-common';
import { getProjectAvatar, addIssueWatcher, postNewIssue } from '../api';
import {
  COMPONENT_ANNOTATION,
  FILTER_ANNOTATION,
  PROJECT_KEY_ANNOTATION,
} from '../annotations';
import { getDefaultFilters } from '../filters';
import {
  getProjectResponse,
  getFiltersFromAnnotations,
  getIssuesFromFilters,
  getIssuesFromComponents,
} from './service';
import { readConfigForEntity } from './lib';

export interface RouterOptions {
  logger: Logger;
  config: Config;
  discovery: DiscoveryApi;
  identity: IdentityApi;
  tokenManager: TokenManager;
  reader: UrlReader;
}

const DEFAULT_TTL = 1000 * 60;

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, discovery, identity, tokenManager, reader } = options;
  const catalogClient = new CatalogClient({ discoveryApi: discovery });
  logger.info('Initializing Jira backend');

  const integrations = ScmIntegrations.fromConfig(config);
  const pluginCache = CacheManager.fromConfig(config).forPlugin('jira');
  const cache = pluginCache.getClient({ defaultTtl: DEFAULT_TTL });

  const router = Router();
  router.use(express.json());
  router.use(errorHandler());

  router.get('/issue-collector/:entityRef', async (request, response) => {
    const entityRef = request.params.entityRef;
    const { token } = await tokenManager.getToken();
    const entity = await catalogClient.getEntityByRef(entityRef, { token });

    if (!entity) {
      logger.warn(`No entity found for ${entityRef}`);
      response.status(500).json({ error: `No entity found for ${entityRef}` });
      return;
    }

    try {
      const { forms } = await readConfigForEntity(
        entity,
        logger,
        integrations,
        reader,
      );
      response.json(forms);
    } catch (error) {
      logger.error('error', error);
      response.status(500).json({ error });
    }
  });

  router.post('/issue-collector/:entityRef', async (request, response) => {
    const { formData } = request.body as PostIssueBodyType;
    const { priority, summary, issuetype, ...fields } = formData;

    // Create the description by joining the fields.
    const description = Object.keys(fields).reduce((description, field) => {
      const value = fields[field];
      const header = startCase(field);

      description += `*${header}*\n\n${value}\n\n`;
      return description;
    }, '');

    const user = await identity.getIdentity({ request: request });
    const userEntityRef = user?.identity.userEntityRef;
    if (!userEntityRef) {
      throw new Error('Unable to get current user');
    }
    logger.info(`Creating Jira issue for user: ${userEntityRef}`);
    const parsedUser = parseEntityRef(user?.identity.userEntityRef, {
      defaultKind: 'user',
    });

    const entityRef = request.params.entityRef;
    const { token } = await tokenManager.getToken();
    const entity = await catalogClient.getEntityByRef(entityRef, { token });

    if (!entity) {
      logger.info(`No entity found for ${entityRef}`);
      response.status(500).json({ error: `No entity found for ${entityRef}` });
      return;
    }

    try {
      const { jiraConfig } = await readConfigForEntity(
        entity,
        logger,
        integrations,
        reader,
      );
      const newIssue: JiraIssue = {
        project: { key: jiraConfig.project },
        summary: summary,
        priority: { name: priority },
        description,
        components: jiraConfig.components
          ? jiraConfig.components.map(name => ({ name }))
          : [],
        labels: jiraConfig.labels,
        issuetype: {
          name: issuetype || 'Task',
        },
        reporter: {
          name: `${parsedUser.name}@example.com`,
        },
      };
      const { key, id } = await postNewIssue(newIssue, config);
      for (let index = 0; index < jiraConfig.watchers.length; index++) {
        const user = jiraConfig.watchers[index];
        await addIssueWatcher(id, `${user}@example.com`, config);
      }
      response.json({ key, id });
    } catch (error) {
      logger.info('error', error);
    }
    return;
  });

  router.get('/:entityRef', async (request, response) => {
    const entityRef = request.params.entityRef;
    const { token } = await tokenManager.getToken();
    const entity = await catalogClient.getEntityByRef(entityRef, { token });

    if (!entity) {
      logger.info(`No entity found for ${entityRef}`);
      response.status(500).json({ error: `No entity found for ${entityRef}` });
      return;
    }

    const projectKey = entity.metadata.annotations?.[PROJECT_KEY_ANNOTATION]!;

    if (!projectKey) {
      logger.info(`No Jira annotation found for ${entityRef}`);
      response
        .status(500)
        .json({ error: `No Jira annotation found for ${entityRef}` });
      return;
    }

    let projectResponse;

    try {
      projectResponse = await getProjectResponse(projectKey, config, cache);
    } catch (err) {
      logger.error('Could not find Jira project');
      response.status(404).json({
        error: `No Jira project found for project key ${projectKey}`,
      });
      return;
    }

    const userIdentity = await identity.getIdentity({ request: request });

    if (!userIdentity) {
      logger.warn(`Could not find user identity`);
    }

    let filters: Filter[] = [];

    const customFilterAnnotations =
      entity.metadata.annotations?.[FILTER_ANNOTATION]?.split(':')!;

    if (customFilterAnnotations) {
      filters = await getFiltersFromAnnotations(
        customFilterAnnotations,
        config,
      );
    } else {
      filters = getDefaultFilters(userIdentity?.identity?.userEntityRef);
    }

    let issues = await getIssuesFromFilters(projectKey, filters, config);

    const componentAnnotations =
      entity.metadata.annotations?.[COMPONENT_ANNOTATION]?.split(':')!;

    if (componentAnnotations) {
      const componentIssues = await getIssuesFromComponents(
        projectKey,
        componentAnnotations,
        config,
      );
      issues = issues.concat(componentIssues);
    }

    const jiraResponse: JiraResponse = {
      project: projectResponse as Project,
      data: issues,
    };

    return response.json(jiraResponse);
  });

  router.get('/avatar/:entityRef', async (request, response) => {
    const { entityRef } = request.params;
    const { token } = await tokenManager.getToken();
    const entity = await catalogClient.getEntityByRef(entityRef, { token });

    if (!entity) {
      logger.info(`No entity found for ${entityRef}`);
      response.status(500).json({ error: `No entity found for ${entityRef}` });
      return;
    }

    const projectKey = entity.metadata.annotations?.[PROJECT_KEY_ANNOTATION]!;

    let projectResponse = await getProjectResponse(projectKey, config, cache);

    if (!projectResponse) {
      logger.error('Could not find Jira project in Jira');
      response.status(400).json({
        error: `No Jira project found for project key ${projectKey}`,
      });
      return;
    }

    const url = projectResponse.avatarUrls['48x48'];

    const avatar = await getProjectAvatar(url, config);

    const ps = new stream.PassThrough();
    const val = avatar.headers.get('content-type');

    response.setHeader('content-type', val ?? '');
    stream.pipeline(avatar.body, ps, err => {
      if (err) {
        logger.error(err);
        return response.sendStatus(400);
      } else return;
    });
    ps.pipe(response);
  });

  return router;
}
