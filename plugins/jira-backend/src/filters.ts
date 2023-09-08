/*
 * Copyright 2022 Axis Communications
 */
import type { Filter } from './types';

export const getDefaultFilters = (userRef?: string): Filter[] => {
  const openFilter: Filter = {
    name: 'Open Issues',
    shortName: 'OPEN',
    query: 'resolution = Unresolved ORDER BY updated DESC',
  };

  const incomingFilter: Filter = {
    name: 'Incoming Issues',
    shortName: 'INCOMING',
    query: 'status = New ORDER BY created ASC',
  };

  const username = userRef?.split('/').slice(1);

  if (!username) {
    return [openFilter, incomingFilter];
  }

  const assignedToMeFilter: Filter = {
    name: 'Assigned to me',
    shortName: 'ME',
    query: `assignee = "${username}@example.com" AND resolution = Unresolved ORDER BY updated DESC`,
  };

  return [openFilter, incomingFilter, assignedToMeFilter];
};
