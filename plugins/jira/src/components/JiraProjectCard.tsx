import { LinkButton } from '@backstage/core-components';
import { Box, Card, Divider, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Avatar } from '@backstage/core-components';
import type { Project } from '../types';

type JiraProjectProps = {
  project: Project;
};

const FIX_ME_AVATAR_SERVICE_BASE_URL = 'https://avatar.example.com/browse';

/**
 * Get the URL to the project.
 */
const getProjectUrl = (project: Project) => {
  const url = new URL(project.self);
  return `https://${url.host}/browse/${project.key}`;
};

const useStyles = makeStyles({
  root: {
    padding: '1rem',
    fontSize: '18px',
    height: '100%',
  },
  section: {
    marginTop: '1rem',
    marginBottom: '2rem',
  },
  label: {
    marginTop: '1rem',
    color: '#A9A9A9',
  },
  value: {
    fontWeight: 800,
    margin: '0.3rem 0 1rem 0 ',
  },
  button: {
    textDecoration: 'none',
    margin: '1rem 0',
  },
});

export const JiraProjectCard = (props: JiraProjectProps) => {
  const { project } = props;
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <Box display="inline-flex" alignItems="center">
        <Avatar
          picture={project.avatarUrls}
          customStyles={{
            width: '40px',
            height: '40px',
          }}
        />

        <Box ml={1}>
          {project.name} | {project.projectTypeKey}
        </Box>
      </Box>
      <Box ml={1} className={classes.section}>
        <Divider />
        <Typography className={classes.label}>Project key</Typography>
        <Typography className={classes.value}>{project.key}</Typography>

        <Typography className={classes.label}>Category</Typography>
        <Typography className={classes.value}>
          {project.projectCategory.name}
        </Typography>

        {project.description && (
          <>
            <Typography className={classes.label}>Description</Typography>
            <Typography className={classes.value}>
              {project.description}
            </Typography>
          </>
        )}

        <Typography className={classes.label}>Project lead</Typography>
        <Box style={{ display: 'flex' }}>
          <Typography className={classes.value}>
            {project.lead.displayName}
          </Typography>
          <Avatar
            picture={`${FIX_ME_AVATAR_SERVICE_BASE_URL}/${project.lead.key}.jpg`}
            customStyles={{
              width: '25px',
              height: '25px',
              marginLeft: '10px',
            }}
          ></Avatar>
        </Box>

        <LinkButton
          color="primary"
          variant="contained"
          className={classes.button}
          to={getProjectUrl(project)}
        >
          Go to project
        </LinkButton>
      </Box>
    </Card>
  );
};
