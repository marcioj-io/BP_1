import { INestApplication } from '@nestjs/common';
import { MethodEnum } from '@prisma/client';
import * as request from 'supertest';

/**
 * Executes base authentication tests for an endpoint.
 *
 * @async
 * @function baseAuthenticationTests
 * @param {string} url - The URL of the endpoint to be tested.
 * @param {MethodEnum} method - The HTTP method used for the request.
 * @param {INestApplication} app - The Nest application instance.
 * @returns {Promise<void>} - A promise resolving when the tests are completed.
 */
export const baseAuthenticationTests = async (
  url: string,
  method: MethodEnum,
  app: INestApplication,
): Promise<void> => {
  await getRequest(url, method, app)
    .set({ Authorization: `Bearer INVALID` })
    .expect(401);

  await getRequest(url, method, app).expect(401);
};

/**
 * Creates and returns an HTTP request object based on the provided URL, method, and Nest application instance.
 *
 * @function getRequest
 * @param {string} url - The URL of the request.
 * @param {MethodEnum} method - The HTTP method of the request.
 * @param {INestApplication} app - The Nest application instance.
 * @returns {import('supertest').Test} - The HTTP request object.
 */
const getRequest = (url: string, method: MethodEnum, app: INestApplication) => {
  switch (method) {
    case MethodEnum.POST:
      return request(app.getHttpServer()).post(url);
    case MethodEnum.PUT:
      return request(app.getHttpServer()).put(url);
    case MethodEnum.DELETE:
      return request(app.getHttpServer()).delete(url);
    case MethodEnum.GET:
      return request(app.getHttpServer()).get(url);
    case MethodEnum.PATCH:
      return request(app.getHttpServer()).patch(url);
  }
};
