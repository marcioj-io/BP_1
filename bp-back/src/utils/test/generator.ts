import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';

import { EMAIL_TEST } from './constants';

/**
 * Generates a test access token using JWT.
 *
 * @param {JwtService} jwtService - The JWT service for signing the token.
 * @returns {Promise<string>} A promise that resolves to the generated access token.
 *
 * @description
 * This function generates a test JWT access token with a random UUID and a test email.
 */
export const generateAccessTokenTest = async (
  jwtService: JwtService,
): Promise<string> => {
  return await jwtService.signAsync({
    id: faker.string.uuid(),
    email: EMAIL_TEST,
  });
};
