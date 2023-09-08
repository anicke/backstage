import yaml from 'yaml';
import { z } from 'zod';
import { Logger } from 'winston';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { ScmIntegrationRegistry } from '@backstage/integration';
import {
  parseLocationRef,
  getEntitySourceLocation,
} from '@backstage/catalog-model';
import path from 'path';
import { Entity } from '@backstage/catalog-model';
import fs from 'fs-extra';
import { UrlReader } from '@backstage/backend-common';
import { getDefaultSchemas } from '../jira-collector';

const JIRA_ISSUE_COLLECTOR_ANNOTATION = 'jira/issue-collector';

const JiraCollectorConfig = z.object({
  project: z.string(),
  components: z.string().array().default([]),
  labels: z.string().array().default([]),
  watchers: z.string().array().default([]),
  forms: z
    .object({
      title: z.string(),
      schema: z.string(),
      uiSchema: z.string().optional(),
    })
    .array(),
});

type JiraCollectorConfigType = z.infer<typeof JiraCollectorConfig>;

export function toAbsoluteUrl(
  integrations: ScmIntegrationRegistry,
  base: LocationSpec,
  target: string,
): string {
  try {
    if (base.type === 'file') {
      if (target.startsWith('.')) {
        return path.join(path.dirname(base.target), target);
      }
      return target;
    }
    return integrations.resolveUrl({ url: target, base: base.target });
  } catch (e) {
    return target;
  }
}

/**
 * Fetch the main yaml configuration regardless if it from git or local storage.
 */
async function fetchYamlConfig(
  reader: UrlReader,
  target: string,
): Promise<JiraCollectorConfigType> {
  if (target.startsWith('http')) {
    const urlResponse = await reader.readUrl(target);

    const content = (await urlResponse.buffer()).toString('utf-8');
    return JiraCollectorConfig.parse(yaml.parse(content));
  } else {
    return JiraCollectorConfig.parse(
      yaml.parse(await fs.readFile(target, 'utf-8')),
    );
  }
}

/**
 * Fetch json from the target.
 */
async function fetchJson(
  reader: UrlReader,
  target: string | undefined,
): Promise<undefined | Object> {
  if (!target) {
    return undefined;
  }
  if (target.startsWith('http')) {
    const urlResponse = await reader.readUrl(target);
    const content = (await urlResponse.buffer()).toString('utf-8');
    return JSON.parse(content);
  } else {
    return await fs.readJSON(target, 'utf-8');
  }
}

/**
 * Read configuration from the files.
 */
export const readConfigForEntity = async (
  entity: Entity,
  logger: Logger,
  integrations: ScmIntegrationRegistry,
  reader: UrlReader,
) => {
  const locationRef = parseLocationRef(
    entity.metadata?.annotations?.[JIRA_ISSUE_COLLECTOR_ANNOTATION] || '',
  );
  const managedLocation = getEntitySourceLocation(entity);

  if (!managedLocation) {
    throw new Error(
      `Unable to get source location for entity ${entity.metadata.name}`,
    );
  }
  if (!locationRef) {
    throw new Error(`No locationRef for ${locationRef}`);
  }

  const configLocation = toAbsoluteUrl(
    integrations,
    managedLocation,
    locationRef.target,
  );
  if (!configLocation) {
    throw new Error(`Unable to get config location for ${locationRef}`);
  }
  logger.info(`Reading config at ${configLocation}`);
  const jiraConfig = await fetchYamlConfig(reader, configLocation);

  let formItems = [];

  for (let index = 0; index < jiraConfig.forms.length; index++) {
    const form = jiraConfig.forms[index];
    const schemaLocation = toAbsoluteUrl(
      integrations,
      { type: managedLocation.type, target: configLocation },
      form.schema,
    );

    let uiSchemaLocation: string | undefined;
    if (form.uiSchema) {
      uiSchemaLocation = toAbsoluteUrl(
        integrations,
        { type: managedLocation.type, target: configLocation },
        form.uiSchema,
      );
    }
    const schema = await fetchJson(reader, schemaLocation);
    const uiSchema = await fetchJson(reader, uiSchemaLocation);
    formItems.push({
      title: form.title,
      schema,
      uiSchema,
    });
  }
  if (formItems.length === 0) {
    formItems = getDefaultSchemas();
  }
  return { jiraConfig, forms: formItems };
};
