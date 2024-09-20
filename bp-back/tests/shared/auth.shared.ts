import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserToken } from 'src/auth/dto/response/UserToken';
import { EMAIL_TEST, PASSWORD_TEST } from 'src/utils/test/constants';
import * as request from 'supertest';

/**
 * Authenticates a user using the provided NestJS application and returns a UserToken.
 *
 * @param {INestApplication} app - The NestJS application instance.
 * @returns {Promise<UserToken>} A promise that resolves to a UserToken containing access and refresh tokens.
 */
export const authenticateUser = async (
  app: INestApplication,
  email: string = EMAIL_TEST,
  password: string = PASSWORD_TEST,
): Promise<UserToken> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password,
    })
    .expect(200);

  expect(response.body).toHaveProperty('accessToken');
  expect(response.body).toHaveProperty('refreshToken');

  return response.body;
};

/**
 * Tests the authentication of a user with the provided email and password using the NestJS application.
 *
 * @param {INestApplication} app - The NestJS application instance.
 * @param {string} email - The email of the user to authenticate.
 * @param {string} password - The password of the user to authenticate.
 * @returns {Promise<UserToken>} A promise that resolves to a UserToken containing access and refresh tokens.
 */
export const testAuthenticationUser = async (
  app: INestApplication,
  email: string,
  password: string,
  expectStatus = 200,
): Promise<UserToken> => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password,
    })
    .expect(expectStatus);

  if (expectStatus === 200 || expectStatus === 201) {
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  }

  return response.body;
};

export const findUserIdByEmail = async (
  prisma: PrismaClient,
  email: string,
): Promise<string> => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  return user?.id;
};
