import * as Excel from 'exceljs';

/**
 * Generates an Excel file with the given data, headers, and sheet name.
 *
 * @param {any[]} data - The array of data objects to be included in the Excel file.
 * @param {string[]} headers - The headers for the Excel sheet columns.
 * @param {string} sheetName - The name of the sheet in the Excel file.
 * @returns {Promise<Buffer>} A promise that resolves to the buffer of the generated Excel file.
 *
 * @example
 * // Example of using generateExcel function
 * const data = [
 *   { Name: 'John Doe', Age: 30 },
 *   { Name: 'Jane Doe', Age: 25 }
 * ];
 * const headers = ['Name', 'Age'];
 * const sheetName = 'Employees';
 *
 * generateExcel(data, headers, sheetName)
 *   .then(buffer => {
 *     // Use the buffer to send the Excel file in a response or save it to a file
 *   })
 *   .catch(error => {
 *     // Handle error
 *   });
 *
 * @description
 * This function creates an Excel file with specified data, headers, and sheet name.
 * It adds the headers as the first row of the Excel sheet and then fills in the data.
 * The function returns a buffer of the generated Excel file, which can be sent in an HTTP response
 * or saved to a file.
 *
 * // Usage of the response:
 *
 * response.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 *   response.setHeader('Content-Disposition', 'attachment; filename=Report.xlsx');
 *
 *   response.status(HttpStatus.OK).send(buffer);
 */
export const generateExcel = async (
  data: any[],
  headers: string[],
  sheetName: string,
): Promise<Excel.Buffer> => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = headers.map(header => ({ header, key: header }));

  worksheet.addRows(data);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
