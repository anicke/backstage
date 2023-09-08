/*
 * Copyright 2022 Axis Communications
 */

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
  shortName: string;
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
  avatarUrls: { '48x48': string };
};

export type JiraResponse = {
  project: Project;
  data: JiraDataResponse[];
};

export type PostIssueBodyType = {
  formData: any;
};

export type JiraIssue = {
  project: { key: string };
  issuetype: {
    name: string;
  };
  summary: string;
  description: string;
  priority: {
    name: string;
  };
  labels: string[];
  components?: { name: string }[];
  reporter: {
    name: string;
  };
};

export type NewJiraIssueResponse = {
  id: string;
  key: string;
  self: string;
};
