/**
 * Reformats a Date object to a string with a specific format.
 *
 * @param {Date} dateUnformatted - The Date object to be reformatted.
 * @param {boolean} [ptBrFormat=false] - Flag to use Brazilian date format (dd-mm-yyyy).
 * @returns {string} The reformatted date string.
 *
 * @description
 * This function reformats a Date object into a string. If `ptBrFormat` is true,
 * the format will be 'dd-mm-yyyy hh:mm:ss.ms', otherwise 'yyyy-mm-dd hh:mm:ss.ms'.
 * It uses helper functions to ensure proper formatting of each component of the date.
 */
export const reformatDate = (
  dateUnformatted: Date,
  ptBrFormat = false,
): string => {
  if (dateUnformatted === null || dateUnformatted == undefined) return;
  const day: string | number = reformatNumbers(dateUnformatted.getDate());
  const month: string | number = reformatNumbers(
    dateUnformatted.getMonth() + 1,
  );
  const year: string | number = dateUnformatted.getFullYear();
  const hour: string | number = reformatNumbers(dateUnformatted.getHours());
  const minutes: string | number = reformatNumbers(
    dateUnformatted.getMinutes(),
  );
  const seconds: string | number = reformatNumbers(
    dateUnformatted.getSeconds(),
  );
  const miliseconds: string | number = reformatMilisseconds(
    dateUnformatted.getMilliseconds(),
  );

  return ptBrFormat
    ? `${day}-${month}-${year} ${hour}:${minutes}:${seconds}.${miliseconds}`
    : `${year}-${month}-${day} ${hour}:${minutes}:${seconds}.${miliseconds}`;
};

/**
 * Reformats a Date object to a string without time information.
 *
 * @param {Date} dateUnformatted - The Date object to be reformatted.
 * @param {boolean} [ptBrFormat=false] - Flag to use Brazilian date format (dd-mm-yyyy).
 * @returns {string} The reformatted date string without time.
 *
 * @description
 * This function reformats a Date object into a date string without hours, minutes, or seconds.
 * If `ptBrFormat` is true, the format will be 'dd-mm-yyyy', otherwise 'yyyy-mm-dd'.
 */
export const reformatDateWithoutHours = (
  dateUnformatted: Date,
  ptBrFormat = false,
): string => {
  if (dateUnformatted === null || dateUnformatted == undefined) return;
  const day: string | number = reformatNumbers(dateUnformatted.getDate());
  const month: string | number = reformatNumbers(
    dateUnformatted.getMonth() + 1,
  );
  const year: string | number = dateUnformatted.getFullYear();

  return ptBrFormat ? `${day}-${month}-${year}` : `${year}-${month}-${day}`;
};

/**
 * Utils private
 * Formats a number to ensure it has two digits.
 *
 * @param {number} numeroData - The number to be formatted.
 * @returns {string | number} The formatted number as a two-digit string, or the original number if already two digits.
 *
 * @description
 * This helper function ensures that a number is formatted as a two-digit string,
 * adding a leading zero if necessary. It's used for formatting date components.
 */
const reformatNumbers = (numeroData: number) => {
  return numeroData < 10 ? `0${numeroData}` : numeroData;
};

/**
 * Utils private
 * Formats milliseconds to ensure proper string representation.
 *
 * @param {number} numeroMili - The milliseconds number to be formatted.
 * @returns {string | number} The formatted milliseconds as a string, or the original number if already formatted.
 *
 * @description
 * This helper function formats the milliseconds component of a date into a string,
 * adding a leading zero if necessary. It's used for precise time formatting.
 */
const reformatMilisseconds = (numeroMili: number) => {
  return numeroMili < 100 ? `0${numeroMili}` : numeroMili;
};

/**
 * Converts a duration in seconds to a human-readable format.
 *
 * @param {number} seconds - The number of seconds.
 * @returns {string} The duration formatted as a human-readable string.
 *
 * @description
 * This function takes a duration in seconds and converts it into a human-readable format,
 * such as '2 horas e 15 minutos'. It handles various cases, including durations in seconds,
 * minutes, hours, and days.
 */
export const formatSecondsToDuration = seconds => {
  if (!seconds || isNaN(seconds)) {
    return 'Erro ao calcular duração';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 1) {
    return `${seconds} segundos`;
  } else if (minutes < 60) {
    const remainingSeconds = seconds % 60;
    const minStr = minutes === 1 ? 'minuto' : 'minutos';
    const remainingStr = remainingSeconds === 1 ? 'segundo' : 'segundos';
    return `${minutes} ${minStr} e ${remainingSeconds} ${remainingStr}`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hourStr = hours === 1 ? 'hora' : 'horas';
    const finalStr = remainingMinutes === 1 ? 'minuto' : 'minutos';

    if (hours > 0 && remainingMinutes > 0) {
      return `${hours} ${hourStr} e ${remainingMinutes} ${finalStr}`;
    } else if (hours > 0) {
      return `${hours} ${hourStr}`;
    } else {
      return `${remainingMinutes} ${finalStr}`;
    }
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingMinutes = minutes % 1440;
    const hours = Math.floor(remainingMinutes / 60);
    const finalMinutes = remainingMinutes % 60;
    const dayStr = days === 1 ? 'dia' : 'dias';
    let hourStr = '';
    let finalStr = '';

    if (hours > 0) {
      hourStr = `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    if (finalMinutes > 0) {
      finalStr = `${finalMinutes} ${finalMinutes === 1 ? 'minuto' : 'minutos'}`;
    }

    if (days > 0 && hours > 0 && finalMinutes > 0) {
      return `${days} ${dayStr}, ${hourStr} e ${finalStr}`;
    } else if (days > 0 && hours > 0) {
      return `${days} ${dayStr} e ${hourStr}`;
    } else if (days > 0 && finalMinutes > 0) {
      return `${days} ${dayStr} e ${finalStr}`;
    } else if (hours > 0 && finalMinutes > 0) {
      return `${hourStr} e ${finalStr}`;
    } else if (days > 0) {
      return `${days} ${dayStr}`;
    } else if (hours > 0) {
      return hourStr;
    } else {
      return finalStr;
    }
  }
};
