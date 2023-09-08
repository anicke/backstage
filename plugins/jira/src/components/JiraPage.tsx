import React from 'react';
import { Grid } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Content,
  ContentHeader,
  Progress,
  ResponseErrorPanel,
  SupportButton,
} from '@backstage/core-components';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { JiraTable } from './JiraTable';
import { JiraProjectCard } from './JiraProjectCard';
import { useJira } from '../hooks/useJira';
import { useApi } from '@backstage/core-plugin-api';
import { jiraApiRef } from '../api';
import { PROJECT_KEY_ANNOTATION } from '../annotations';

export const JiraPage = () => {
  const { entity } = useEntity();
  const projectKey = entity?.metadata.annotations?.[PROJECT_KEY_ANNOTATION]!;
  const jiraApi = useApi(jiraApiRef);

  const {
    data: jiraResponse,
    loading,
    error,
  } = useJira(stringifyEntityRef(entity), projectKey, jiraApi);

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;
  if (!jiraResponse) return null;

  return (
    <Content>
      <ContentHeader title="Jira">
        <SupportButton></SupportButton>
      </ContentHeader>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <JiraProjectCard project={jiraResponse.project} />
        </Grid>
        {jiraResponse.data.map(
          value =>
            !!value.issues && (
              <Grid key={value.name} item md={6} xs={12}>
                <JiraTable value={value} />
              </Grid>
            ),
        )}
      </Grid>
    </Content>
  );
};
