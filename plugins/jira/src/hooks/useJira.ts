import { useAsync } from 'react-use';
import { JiraApi } from '../api';
import type { JiraResponse } from '../types';

export function useJira(
  entityRef: string,
  projectKey: string,
  jiraApi: JiraApi,
): {
  data: JiraResponse | undefined;
  loading: boolean;
  error: Error | undefined;
} {
  const {
    value: data,
    loading,
    error,
  } = useAsync(async (): Promise<any> => {
    const response = await jiraApi.getJiraResponseByEntity(
      entityRef,
      projectKey,
    );
    response.project.avatarUrls = await jiraApi.getProjectAvatar(entityRef);
    return response;
  });

  return { data, loading, error };
}
