import { HttpService } from '@nestjs/axios';

/**
 * Retrieves the ZIP code for a given latitude and longitude using the Google Maps API.
 *
 * @param {string} lat - The latitude as a string.
 * @param {string} lng - The longitude as a string.
 * @returns {Promise<string | null>} A promise that resolves to the ZIP code if found, or null if not found.
 *
 * @example
 * // Example of using getZipCodeByLatLng function
 * getZipCodeByLatLng('40.714224', '-73.961452')
 *   .then(cep => {
 *     if (cep) {
 *       console.log(`ZIP Code: ${cep}`);
 *     } else {
 *       console.log('ZIP Code not found');
 *     }
 *   })
 *   .catch(error => {
 *     console.error('Error occurred:', error);
 *   });
 *
 * @description
 * This function takes latitude and longitude as inputs and uses the Google Maps API
 * to fetch the corresponding ZIP code. It makes an HTTP GET request to the Google Maps API
 * with the provided latitude and longitude. The function parses the response to extract
 * the ZIP code from the 'address_components'. The ZIP code is assumed to be the 'long_name'
 * property of the component where 'types' includes 'postal_code'.
 */
export const getZipCodeByLatLng = async (lat: string, lng: string) => {
  const responseGoogle = await new HttpService()
    .get(
      `${process.env.GOOGLE_API_URL}?address=${encodeURIComponent(
        `${lat},${lng}`,
      )}&key=${process.env.GOOGLE_API_KEY}`,
    )
    .toPromise();

  let cep: string | null = null;
  responseGoogle?.data?.results[0]?.address_components?.forEach(item => {
    if (item.types[0] === 'postal_code') {
      cep = item.long_name.split('-')[0];
    }
  });

  return cep;
};
