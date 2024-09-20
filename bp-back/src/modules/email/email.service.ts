import { InternalServerErrorException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { randomUUID } from 'crypto';
import { MessagesHelperKey, getMessage } from 'src/helpers/messages.helper';
import { isTestEnviroment } from 'src/utils/environment';
import { Languages } from 'src/utils/language-preference';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  /**
   * Sends an email with the given markup content.
   *
   * @param {string} markup - The HTML content to be sent in the email.
   * @param {string} subject - The subject of the email.
   * @param {string} sendToEmail - The recipient's email address.
   *
   * @returns {Promise<void>} A promise that resolves when the email is sent successfully or throws an error otherwise.
   *
   * @description
   * Sends an email using SendGrid with the specified HTML content, subject, and recipient email address.
   * It uses environment variables for configuration and includes a sandbox mode for testing environments.
   * The method logs the process and handles any errors encountered during the email sending process.
   */
  sendEmail = async (
    markup: string,
    subject: string,
    sendToEmail: string,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      files?: {
        filename: string;
        contentType: string;
        cid: string;
        content: string;
      }[];
      attachments?: {
        content: string;
        filename: string;
        type: string;
        content_id: string;
        disposition: string;
      }[];
    },
  ): Promise<void> => {
    const identifierRequest = optionals?.identifierRequest ?? randomUUID();

    const mailOptions = {
      from: process.env.EMAIL_OPTIONS_FROM,
      to: sendToEmail,
      subject: subject,
      html: markup,
      ...(optionals?.attachments && {
        attachments: [...optionals?.attachments],
      }),
      mail_settings: {
        sandbox_mode: {
          enable: isTestEnviroment(),
        },
      },
    };

    this.logger.debug(`${identifierRequest} Sending email to ${sendToEmail}`);

    await sgMail.send(mailOptions).catch(error => {
      if (error) {
        this.logger.error(
          `${identifierRequest} Error sending email to ${sendToEmail} - ${error}`,
        );
        throw new InternalServerErrorException(
          getMessage(MessagesHelperKey.FAIL_SENDING_EMAIL, languagePreference),
        );
      }
    });
  };
}
