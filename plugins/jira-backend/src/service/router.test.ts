import {
  getVoidLogger,
  HostDiscovery,
  TokenManager,
  UrlReaders,
} from '@backstage/backend-common';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { ConfigReader } from '@backstage/config';
import express from 'express';
import request from 'supertest';
import { createLogger } from 'winston';

import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express;
  let mockTokenManager: jest.Mocked<TokenManager>;

  beforeAll(async () => {
    const config = new ConfigReader({ backend: { baseUrl: '127.0.0.1:3000' } });
    const discovery = HostDiscovery.fromConfig(config);
    const router = await createRouter({
      logger: getVoidLogger(),
      config,
      reader: UrlReaders.default({ logger: createLogger(), config }),
      discovery: HostDiscovery.fromConfig(config),
      identity: DefaultIdentityClient.create({
        discovery,
      }),
      tokenManager: mockTokenManager,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      // TODO: Write proper tests.
      const response = await request(app).get('/health');
      expect(response.status).toEqual(500);
    });
  });
});
