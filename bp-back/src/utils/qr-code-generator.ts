import * as QRCode from 'qrcode';

/**
 * Generates a QR code for a given URL.
 *
 * @param {string} url - The URL to be converted into a QR code.
 * @returns {Promise<string>} A promise that resolves to a string representing the QR code in Data URL format.
 *
 * @example
 * generateQRCode('https://www.example.com')
 *   .then(qrCodeDataUrl => console.log(qrCodeDataUrl))
 *   .catch(err => console.error(err));
 *
 * @description
 * This function takes a URL string as input and returns a promise that resolves to a QR code
 * represented in Data URL format. It uses the 'qrcode' library to generate the QR code.
 */
export const generateQRCode = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url);
  } catch (err) {
    console.error('[generateQRCode] ' + err);
  }
};
