import {
  createServiceBuilder,
  loadBackendConfig,
  HostDiscovery,
  ServerTokenManager,
  UrlReaders,
} from '@backstage/backend-common';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'jira-backend' });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const reader = UrlReaders.default({ logger, config });
  const discovery = HostDiscovery.fromConfig(config);
  const tokenManager = ServerTokenManager.fromConfig(config, {
    logger,
  });
  const identity = DefaultIdentityClient.create({
    discovery,
  });
  logger.debug('Starting application server...');
  const router = await createRouter({
    config,
    logger,
    discovery,
    tokenManager,
    identity,
    reader,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/jira', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
