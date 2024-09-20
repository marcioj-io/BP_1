/**
 * Excludes specified fields from an object and returns a new object.
 *
 * @template T - The type of the original object.
 * @template K - The type of the keys to be excluded from the object.
 * @param {T} object - The original object from which fields need to be excluded.
 * @param {K[]} keys - An array of keys representing the fields to be excluded.
 * @returns {Omit<T, K>} A new object with the specified keys excluded.
 *
 * @example
 * // Example of using excludeObjectFields
 * const user = { name: 'John', age: 30, email: 'john@example.com' };
 * const filteredUser = excludeObjectFields(user, ['email']);
 * // filteredUser will be { name: 'John', age: 30 }
 *
 * @description
 * This function takes an object and an array of keys, and returns a new object
 * from which the specified keys have been excluded. It's useful when you want to
 * omit certain fields from an object, for example, to exclude sensitive information
 * before sending an object to the client.
 */
function excludeObjectFields<T, K extends keyof T>(
  object: T,
  keys: K[],
): Omit<T, K> {
  const result: Partial<T> = { ...object };

  keys.forEach(key => {
    delete result[key];
  });

  return result as Omit<T, K>;
}
