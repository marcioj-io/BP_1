import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { MethodEnum, PrismaClient, StatusEnum } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { MAX_FAILED_LOGIN_ATTEMPTS } from 'src/utils/constants';
import {
  EMAIL_NOT_FOUND,
  EMAIL_TEST,
  PASSWORD_TEST,
} from 'src/utils/test/constants';
import * as request from 'supertest';

import {
  revertUserToInitialState,
  blockUserAndInactive,
  changeUserStatus,
} from './fixtures/user/user.test-utils';
import { authenticateUser, testAuthenticationUser } from './shared/auth.shared';
import { baseAuthenticationTests } from './shared/base.tests';

describe('Auth module E2E Tests', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  let bearerToken = '';
  let refreshToken = '';
  let loggedUserId = '';
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([
          {
            limit: 9999,
            ttl: 30000,
          },
        ]),
      ],
    }).compile();

    app = module.createNestApplication();

    const jwtServiceInjection = module.get<JwtService>(JwtService);

    jwtService = jwtServiceInjection;

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();

    const authenticatedLoggedUser = await authenticateUser(
      app,
      EMAIL_TEST,
      PASSWORD_TEST,
    );

    bearerToken = authenticatedLoggedUser.accessToken;
    refreshToken = authenticatedLoggedUser.refreshToken;

    const loggedTestUser = await prisma.user.findUnique({
      where: {
        email: EMAIL_TEST,
      },
    });

    loggedUserId = loggedTestUser.id;
  });

  beforeEach(async () => {
    await revertUserToInitialState(prisma, {
      email: EMAIL_TEST,
      revertEmail: EMAIL_TEST,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      await prisma.$disconnect();
    }
  });

  describe('Login', () => {
    const endPointUrl = '/auth/login';

    it('Should login', async () => {
      const response = await request(app.getHttpServer())
        .post(endPointUrl)
        .send({
          email: EMAIL_TEST,
          password: PASSWORD_TEST,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('User doesnt exists', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .send({
          email: EMAIL_NOT_FOUND,
          password: PASSWORD_TEST,
        })
        .expect(401);
    });

    it('User exists but password is wrong', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .send({
          email: EMAIL_TEST,
          password: 'PASSWORD_WRONG',
        })
        .expect(401);
    });

    it('Email is not present in request', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .send({
          password: 'PASSWORD_WRONG',
        })
        .expect(401);
    });

    it('Password is not present in request', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .send({
          email: EMAIL_TEST,
        })
        .expect(401);
    });
  });

  describe('Get Me', () => {
    const endPointUrl = '/auth/me';

    it('Should get me', async () => {
      const response = await request(app.getHttpServer())
        .get(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send()
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(endPointUrl, MethodEnum.GET, app);
    });
  });

  describe('Forgot password', () => {
    const endPointUrl = '/auth/forgot/password';

    it('Should send a password recovery email for a valid user', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .send({ email: EMAIL_TEST })
        .expect(200);
    });

    it('Should return an OK for a non-existing user but dont send email', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .send({ email: EMAIL_NOT_FOUND })
        .expect(200);
    });

    it('Should return an error if email is not provided', async () => {
      await request(app.getHttpServer()).post(endPointUrl).send().expect(400);
    });
  });

  describe('Change password from recovery', () => {
    const endPointUrl = '/auth/recovery/password';
    let recoveryEmailToken = '';
    const newPassword = 'pass@WorldNew123';
    const invalidToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    it('Should change the password', async () => {
      const token = await jwtService.signAsync(
        {
          sub: EMAIL_TEST,
        },
        {
          secret: process.env.TK_EMAIL_SECRET,
          expiresIn: process.env.TK_EMAIL_LIFETIME,
        },
      );

      recoveryEmailToken = token;

      await request(app.getHttpServer())
        .patch(endPointUrl)
        .send({
          accessToken: token,
          newPassword: newPassword,
        })
        .expect(200);

      await testAuthenticationUser(app, EMAIL_TEST, newPassword);
    });

    it('Should return an error if try to update the user more than one time with an unique access token', async () => {
      await request(app.getHttpServer())
        .patch(endPointUrl)
        .send({
          accessToken: recoveryEmailToken,
          newPassword,
        })
        .expect(401);
    });

    it('Should return an error for an invalid access token', async () => {
      await request(app.getHttpServer())
        .patch(endPointUrl)
        .send({ newPassword, accessToken: invalidToken })
        .expect(401);
    });

    it('Should return an error if new password is not provided', async () => {
      await request(app.getHttpServer())
        .patch(endPointUrl)
        .send({ accessToken: recoveryEmailToken })
        .expect(400);
    });

    it('Should return an error if access token is not provided', async () => {
      await request(app.getHttpServer())
        .patch(endPointUrl)
        .send({ newPassword })
        .expect(400);
    });
  });

  describe('Email availability', () => {
    const endPointUrl = '/auth/email/availability';

    it('[Create] Should return true if email is available', async () => {
      const emailAvailable = 'availableemail@gmail.com';
      const response = await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({
          email: emailAvailable,
        })
        .expect(200);

      expect(response.body).toHaveProperty('available');
      expect(response.body.available).toBe(true);
    });

    it('[Update] Should return true if email is available', async () => {
      const emailAvailable = 'availableemail@gmail.com';
      const response = await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({
          email: emailAvailable,
          userBeingEditedId: loggedUserId,
        })
        .expect(200);

      expect(response.body).toHaveProperty('available');
      expect(response.body.available).toBe(true);
    });

    it('[Update] Should return true if email is not available but its yours', async () => {
      const response = await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({
          email: EMAIL_TEST,
          userBeingEditedId: loggedUserId,
        })
        .expect(200);

      expect(response.body).toHaveProperty('available');
      expect(response.body.available).toBe(true);
    });

    it('Should return false if email is not available', async () => {
      const response = await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({
          email: EMAIL_TEST,
        })
        .expect(200);

      expect(response.body).toHaveProperty('available');
      expect(response.body.available).toBe(false);
    });

    it('Should return 400 if email is not present in request', async () => {
      return await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({})
        .expect(400);
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(endPointUrl, MethodEnum.POST, app);
    });
  });

  describe('Resend activation email', () => {
    const endPointUrl = '/auth/resend';

    beforeEach(async () => {
      await changeUserStatus(prisma, EMAIL_TEST, StatusEnum.PENDING);
    });

    afterAll(async () => {
      await changeUserStatus(prisma, EMAIL_TEST, StatusEnum.ACTIVE);
    });

    it('Should return 200 if email was deliveried', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({
          email: EMAIL_TEST,
        })
        .expect(200);
    });

    it('Should return 404 if email doesnt exists', async () => {
      return await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({
          email: EMAIL_NOT_FOUND,
        })
        .expect(404);
    });

    it('Should return 400 if email is not present in request', async () => {
      return await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({})
        .expect(400);
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(endPointUrl, MethodEnum.POST, app);
    });
  });

  describe('Refresh Token', () => {
    const endPointUrl = '/auth/refresh';

    it('Should refresh token', async () => {
      const response = await request(app.getHttpServer())
        .get(endPointUrl)
        .set({ Authorization: `Bearer ${refreshToken}` })
        .query({ refreshToken: refreshToken })
        .send()
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      bearerToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(endPointUrl, MethodEnum.GET, app);
    });
  });

  describe('Lock account middleware', () => {
    const endPointUrl = '/auth/login';

    it('Should lock account after multiple failed login attempts', async () => {
      // Block user
      await prisma.user.update({
        where: {
          email: EMAIL_TEST,
        },
        data: {
          loginAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
          blocked: true,
        },
      });

      // Try to login with blocked user
      await request(app.getHttpServer())
        .post(endPointUrl)
        .send({
          email: EMAIL_TEST,
          password: PASSWORD_TEST,
        })
        .expect(403);
    });
  });

  describe('Trying to make request with blocked or inactivated user', () => {
    const endPointUrl = '/auth/login';

    it('Should prevent login for a blocked or inactive user', async () => {
      await blockUserAndInactive(prisma, EMAIL_TEST);

      await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .send({ email: EMAIL_TEST, password: PASSWORD_TEST })
        .expect(403);
    });
  });

  describe('Logout user', () => {
    const endPointUrl = '/auth/logout';

    it('Should logout', async () => {
      await request(app.getHttpServer())
        .post(endPointUrl)
        .set({ Authorization: `Bearer ${bearerToken}` })
        .expect(200);
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(endPointUrl, MethodEnum.POST, app);
    });
  });
});
