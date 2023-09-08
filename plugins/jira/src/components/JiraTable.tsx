import { Table } from '@backstage/core-components';
import React from 'react';
import { columns } from './columns';
import type { JiraDataResponse } from '../types';
import { capitalize } from 'lodash';
import { makeStyles } from '@material-ui/core';

type Props = {
  value: JiraDataResponse;
};

const useStyles = makeStyles(theme => ({
  root: {
    colorScheme: theme.palette.type,
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const JiraTable = (props: Props) => {
  const { name, issues } = props.value;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Table
        title={`${capitalize(name)} (${issues.length})`}
        options={{
          paging: false,
          padding: 'dense',
          search: true,
        }}
        data={issues}
        columns={columns}
        emptyContent={
          <div className={classes.empty}>No issues found&nbsp;</div>
        }
        style={{
          height: '412px',
          padding: '20px',
          overflowY: 'scroll',
          width: '100%',
        }}
      />
    </div>
  );
};
