import puppeteer, { PDFOptions, PaperFormat } from 'puppeteer';

/**
 * Generates a PDF file from an HTML template string.
 *
 * @param {string} htmlTemplate - The HTML template string used to generate the PDF.
 * @returns {Promise<string>} A promise that resolves to a base64 encoded string of the generated PDF.
 *
 * @example
 * // Example of using createPdf function
 * const htmlTemplate = `<html><body><h1>Title</h1><p>This is a paragraph.</p></body></html>`;
 *
 * createPdf(htmlTemplate)
 *   .then(pdfBase64 => {
 *     // Use the base64 encoded PDF string as needed
 *   })
 *   .catch(error => {
 *     // Handle error
 *   });
 *
 * @description
 * This function takes an HTML template string and converts it into a PDF file.
 * The PDF is generated using the Puppeteer library and is returned as a base64 encoded string.
 * This can be useful for generating reports, invoices, or any other documents that need to be
 * rendered as a PDF from HTML. The function sets up a headless browser, sets the page content
 * to the HTML template, generates the PDF, and then closes the browser.
 */
export const createPdf = async (htmlTemplate: string): Promise<string> => {
  const options: PDFOptions = {
    format: 'A4' as PaperFormat,
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(htmlTemplate);
  const pdfBuffer = await page.pdf(options);
  await browser.close();
  return pdfBuffer.toString('base64');
};
