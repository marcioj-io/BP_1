import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MethodEnum, PrismaClient } from '@prisma/client';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

import {
  generateCreateInput,
  generateUpdateInput,
} from './fixtures/costcenter/costcenter.fixture.generator';
import { revertCostcenterToInitialState } from './fixtures/costcenter/costcenter.test-utils';
import { authenticateUser } from './shared/auth.shared';
import { baseAuthenticationTests } from './shared/base.tests';

describe('Costcenter module E2E Tests', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  let bearerToken = '';
  let costcenterId = '';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();

    const authData = await authenticateUser(app);
    bearerToken = authData.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    if (costcenterId) {
      await revertCostcenterToInitialState(prisma, costcenterId);
    }
  });

  describe('Create Costcenter', () => {
    const endPointUrl = '/costcenter';

    it('Should create Costcenter', async () => {
      const response = await request(app.getHttpServer())
        .post(`${endPointUrl}`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(generateCreateInput())
        .expect(201);

      expect(response.body).toBeDefined();
      costcenterId = response.body;
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}`, MethodEnum.POST, app);
    });
  });

  describe('Get filtered Costcenter', () => {
    const endPointUrl = '/costcenter';

    it('Should get data', async () => {
      const response = await request(app.getHttpServer())
        .get(`${endPointUrl}`)
        .query({
          page: 1,
          perPage: 10,
          orderBy: { id: 'desc' },
        })
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();

      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.length).toBeGreaterThan(0);

      if (response.body.data.length > 0) {
        const firstItem = response.body.data[0];
        expect(firstItem).toHaveProperty('id');
      }

      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
      expect(response.body.meta.lastPage).toBeDefined();
      expect(response.body.meta.currentPage).toBeDefined();
      expect(response.body.meta.perPage).toBeDefined();
      expect(response.body.meta.prev).toBeDefined();
      expect(response.body.meta.next).toBeDefined();
    });

    it('Should get data with per page wrong', async () => {
      const perPage = -1;
      const page = -1;

      const response = await request(app.getHttpServer())
        .get(`${endPointUrl}`)
        .query({
          page,
          perPage,
          orderBy: { id: 'desc' },
        })
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();

      expect(Array.isArray(response.body.data)).toBeTruthy();
      if (response.body.data.length > 0) {
        const firstItem = response.body.data[0];
        expect(firstItem).toHaveProperty('id');
      }

      expect(response.body.data.length).toBeGreaterThan(0);

      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
      expect(response.body.meta.lastPage).toBeDefined();
      expect(response.body.meta.currentPage).toBeDefined();
      expect(response.body.meta.perPage).toBeDefined();
      expect(response.body.meta.prev).toBeDefined();
      expect(response.body.meta.next).toBeDefined();
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}`, MethodEnum.GET, app);
    });
  });

  describe('Get Costcenter by id', () => {
    const endPointUrl = '/costcenter';

    it('Should get data', async () => {
      const response = await request(app.getHttpServer())
        .get(`${endPointUrl}/${costcenterId}`)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .expect(200);

      expect(response.body).toBeDefined();

      expect(response.body).toHaveProperty('id');
    });

    it('Should throw error if Costcenter id doesnt exist', async () => {
      await request(app.getHttpServer())
        .get(`${endPointUrl}/INVALID`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(404);
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}/id`, MethodEnum.GET, app);
    });
  });

  describe('Update', () => {
    const endPointUrl = '/costcenter';

    it('Should update a Costcenter', async () => {
      await request(app.getHttpServer())
        .put(`${endPointUrl}/${costcenterId}`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(generateUpdateInput())
        .expect(200);
    });

    it('Should return not found when does not exist', async () => {
      await request(app.getHttpServer())
        .put(`${endPointUrl}/INVALID`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(generateUpdateInput())
        .expect(404);
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}/id`, MethodEnum.PUT, app);
    });
  });

  describe('Delete Costcenter', () => {
    const endPointUrl = '/costcenter';

    it('Should inactive a Costcenter', async () => {
      await request(app.getHttpServer())
        .delete(`${endPointUrl}/${costcenterId}`)
        .query({ version: 1 })
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(200);
    });

    it('Should return not found when does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`${endPointUrl}/INVALID`)
        .query({ version: 1 })
        .set('Authorization', `Bearer ${bearerToken}`)
        .expect(404);
    });

    it('Should throw error if id is not present', async () => {
      await request(app.getHttpServer())
        .delete(`${endPointUrl}`)
        .query({ version: 1 })
        .set({ Authorization: `Bearer ${bearerToken}` })
        .expect(404);
    });

    it('Should throw error if id is present and version not', async () => {
      await request(app.getHttpServer())
        .delete(`${endPointUrl}/${costcenterId}`)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .expect(400);
    });

    it('Should throw error if id and version is not present', async () => {
      await request(app.getHttpServer())
        .delete(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .expect(404);
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(
        `${endPointUrl}/id`,
        MethodEnum.DELETE,
        app,
      );
    });
  });
});
