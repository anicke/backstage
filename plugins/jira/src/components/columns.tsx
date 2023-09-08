import React from 'react';
import { Avatar, Link, TableColumn } from '@backstage/core-components';
import type { Issue } from '../types';

// TODO: Calculate this in the backend.
const FIX_ME_JIRA_BASE_URL = 'https://jira.example.com/browse';

const FIX_ME_AVATAR_SERVICE_BASE_URL = 'https://avatar.example.com/browse';

export const columns: TableColumn[] = [
  {
    title: 'Key',
    field: 'key',
    highlight: true,
    type: 'string',
    width: '30%',

    render: (issue: Partial<Issue>) => {
      return (
        <Link
          to={`${FIX_ME_JIRA_BASE_URL}/${issue.key}`}
          title="Go to issue in Jira"
        >
          <img
            src={issue.fields?.issuetype.iconUrl}
            alt={issue.fields?.issuetype.name}
            style={{ paddingRight: '15px' }}
          />
          {issue.key}
        </Link>
      );
    },
  },
  {
    title: 'Summary',
    field: 'fields.summary',
    highlight: true,
    type: 'string',
    width: '50%',
    render: (issue: Partial<Issue>) => {
      return (
        <Link
          style={{ lineHeight: 1.5 }}
          to={`${FIX_ME_JIRA_BASE_URL}/${issue.key}`}
          title="Go to issue in Jira"
        >
          {issue.fields?.summary}
        </Link>
      );
    },
  },
  {
    title: 'Status',
    field: 'fields.status.name',
    highlight: true,
    type: 'string',
    width: '20%',

    render: (issue: Partial<Issue>) => {
      return (
        <Link
          to={`${FIX_ME_JIRA_BASE_URL}/${issue.key}`}
          title="Go to issue in Jira"
        >
          {issue.fields?.status.name}
        </Link>
      );
    },
  },
  {
    title: 'Assignee',
    field: 'fields.assignee.name',
    highlight: true,
    type: 'string',
    width: '20%',

    render: (issue: Partial<Issue>) => {
      if (!issue.fields?.assignee)
        return <p style={{ color: 'grey' }}>Unassigned</p>;
      return <>{issue.fields?.assignee.name.split('@')[0]}</>;
    },
  },
  {
    field: 'avatar',
    highlight: true,
    type: 'string',
    width: '30%',
    render: (issue: Partial<Issue>) => {
      if (!issue.fields?.assignee) return <></>;
      return (
        <>
          <Avatar
            picture={`${FIX_ME_AVATAR_SERVICE_BASE_URL}/${
              issue.fields.assignee.name.split('@')[0]
            }.jpg`}
            customStyles={{ width: '25px', height: 'auto' }}
          />
        </>
      );
    },
  },
];
