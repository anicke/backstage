export type Issue = {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee: {
      name: string;
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
  };
};

export type Filter = {
  name: string;
  query: string;
};

export type JiraDataResponse = {
  name: string;
  type: 'component' | 'filter';
  issues: Issue[];
};

export type Project = {
  name: string;
  key: string;
  description: string;
  projectTypeKey: string;
  projectCategory: {
    name: string;
  };
  lead: {
    key: string;
    displayName: string;
  };
  avatarUrls: string;
  self: string;
};

export type JiraResponse = {
  project: Project;
  data: JiraDataResponse[];
};
