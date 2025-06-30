export const OBJECT_MAPPINGS = {
  slice: {
    name: 'slice',
    description: 'Extracts a section of an array from start to end.',
    args: [
      { name: 'array', type: 'array', description: 'The array to slice.' },
      { name: 'start', type: 'integer', description: 'The start index.' },
    ],
    kwargs: [{ name: 'end', type: 'integer', description: 'The end index.', default: null }],
    returnType: 'array',
  },
  remove: {
    name: 'remove',
    description: 'Removes an element from an array or key from a dictionary.',
    args: [
      { name: 'collection', type: 'array|object', description: 'The collection to remove from.' },
      { name: 'element', type: 'any', description: 'The element or key to remove.' },
    ],
    kwargs: [],
    returnType: 'array|object',
  },
  add: {
    name: 'add',
    description: 'Adds an element to an array or key-value pair to a dictionary.',
    args: [
      { name: 'collection', type: 'array|object', description: 'The collection to add to.' },
      { name: 'element', type: 'any', description: 'The element or key to add.' },
    ],
    kwargs: [
      {
        name: 'value',
        type: 'any',
        description: 'The value to add if the collection is a dictionary.',
        default: null,
      },
    ],
    returnType: 'array|object',
  },
  map: {
    name: 'map',
    description: 'Applies a function to each element in a collection.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to map over.' },
      { name: 'function', type: 'function', description: 'The function to apply.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  shuffle: {
    name: 'shuffle',
    description: 'Randomly shuffles the elements of an array.',
    args: [{ name: 'array', type: 'array', description: 'The array to shuffle.' }],
    kwargs: [],
    returnType: 'array',
  },
  reverse: {
    name: 'reverse',
    description: 'Reverses the order of the elements in an array.',
    args: [{ name: 'array', type: 'array', description: 'The array to reverse.' }],
    kwargs: [],
    returnType: 'array',
  },
  flatten: {
    name: 'flatten',
    description: 'Flattens a nested array.',
    args: [{ name: 'array', type: 'array', description: 'The array to flatten.' }],
    kwargs: [],
    returnType: 'array',
  },
  deduplicate: {
    name: 'deduplicate',
    description: 'Removes duplicate elements from an array.',
    args: [{ name: 'array', type: 'array', description: 'The array to deduplicate.' }],
    kwargs: [],
    returnType: 'array',
  },
  join: {
    name: 'join',
    description: 'Joins array elements into a string.',
    args: [{ name: 'array', type: 'array', description: 'The array to join.' }],
    kwargs: [
      { name: 'delimiter', type: 'string', description: 'The delimiter to use.', default: '' },
    ],
    returnType: 'string',
  },
  merge: {
    name: 'merge',
    description: 'Merges two or more arrays/objects.',
    args: [{ name: 'args', type: 'array|object', description: 'The arrays or objects to merge.' }],
    kwargs: [],
    returnType: 'array|object',
  },
  sort: {
    name: 'sort',
    description: 'Sorts the elements of an array.',
    args: [{ name: 'array', type: 'array', description: 'The array to sort.' }],
    kwargs: [
      {
        name: 'reverse',
        type: 'boolean',
        description: 'Whether to sort in reverse order.',
        default: false,
      },
      {
        name: 'key',
        type: 'function',
        description: 'A function to extract a key for sorting.',
        default: null,
      },
    ],
    returnType: 'array',
  },
  distinct: {
    name: 'distinct',
    description:
      'Removes duplicates from an array. If a key is provided, removes duplicates based on the unique values of the specified key.',
    args: [{ name: 'array', type: 'array', description: 'The array to deduplicate.' }],
    kwargs: [
      {
        name: 'key',
        type: 'string',
        description: 'The key to use for deduplication.',
        default: null,
      },
    ],
    returnType: 'array',
  },
  zip_arrays: {
    name: 'zip_arrays',
    description: 'Combines corresponding elements from each array into tuples.',
    args: [{ name: 'arrays', type: 'array', description: 'The arrays to zip.' }],
    kwargs: [],
    returnType: 'array',
  },
  unzip_array: {
    name: 'unzip_array',
    description: 'Separates elements of each tuple in an array of tuples into separate arrays.',
    args: [
      { name: 'array_of_tuples', type: 'array', description: 'The array of tuples to unzip.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  filter: {
    name: 'filter',
    description: 'Filters elements in a collection based on a function.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to filter.' },
      { name: 'function', type: 'function', description: 'The function to apply for filtering.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  reduce: {
    name: 'reduce',
    description: 'Applies a function of two arguments cumulatively to the items of a collection.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to reduce.' },
      { name: 'function', type: 'function', description: 'The function to apply.' },
    ],
    kwargs: [
      { name: 'initializer', type: 'any', description: 'The initial value.', default: null },
    ],
    returnType: 'any',
  },
  group_by: {
    name: 'group_by',
    description:
      'Groups the elements of a collection based on the return value of the key function.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to group.' },
      {
        name: 'key_function',
        type: 'function',
        description: 'The function to determine the key for grouping.',
      },
    ],
    kwargs: [],
    returnType: 'object',
  },
  partition: {
    name: 'partition',
    description:
      "Splits the collection into two arrays: one whose elements satisfy the function and one whose elements don't.",
    args: [
      { name: 'collection', type: 'array', description: 'The collection to partition.' },
      { name: 'function', type: 'function', description: 'The function to test each element.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  pluck: {
    name: 'pluck',
    description:
      'Extracts a list of values associated with a given key from a collection of dictionaries.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to pluck from.' },
      { name: 'key', type: 'string', description: 'The key to pluck.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  deep_flatten: {
    name: 'deep_flatten',
    description: 'Flattens a nested array to a specified depth.',
    args: [{ name: 'array', type: 'array', description: 'The array to flatten.' }],
    kwargs: [
      { name: 'depth', type: 'integer', description: 'The depth to flatten to.', default: null },
    ],
    returnType: 'array',
  },
  update: {
    name: 'update',
    description: 'Updates the value of a key in a dictionary or replaces an element in an array.',
    args: [
      { name: 'collection', type: 'array|object', description: 'The collection to update.' },
      { name: 'key', type: 'any', description: 'The key or index to update.' },
      { name: 'value', type: 'any', description: 'The new value.' },
    ],
    kwargs: [],
    returnType: 'array|object',
  },
  pop: {
    name: 'pop',
    description:
      'Removes and returns an element from an array or a key-value pair from a dictionary.',
    args: [
      { name: 'collection', type: 'array|object', description: 'The collection to pop from.' },
    ],
    kwargs: [{ name: 'key', type: 'any', description: 'The key or index to pop.', default: null }],
    returnType: 'any',
  },
  extend: {
    name: 'extend',
    description: 'Extends a collection (array or dictionary) with elements from other collections.',
    args: [{ name: 'collection', type: 'array|object', description: 'The collection to extend.' }],
    kwargs: [
      { name: 'others', type: 'array|object', description: 'The collections to extend with.' },
    ],
    returnType: 'array|object',
  },
  compact: {
    name: 'compact',
    description: 'Creates an array with all falsey values removed.',
    args: [{ name: 'collection', type: 'array', description: 'The collection to compact.' }],
    kwargs: [],
    returnType: 'array',
  },
  chunk: {
    name: 'chunk',
    description: 'Splits an array into chunks of a specified size.',
    args: [
      { name: 'array', type: 'array', description: 'The array to chunk.' },
      { name: 'size', type: 'integer', description: 'The size of each chunk.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  intersect: {
    name: 'intersect',
    description: 'Returns an array that contains only the elements that are present in all arrays.',
    args: [{ name: 'arrays', type: 'array', description: 'The arrays to intersect.' }],
    kwargs: [],
    returnType: 'array',
  },
  difference: {
    name: 'difference',
    description: 'Returns the elements in array1 that are not in array2.',
    args: [
      { name: 'array1', type: 'array', description: 'The first array.' },
      { name: 'array2', type: 'array', description: 'The second array.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  symmetric_difference: {
    name: 'symmetric_difference',
    description:
      'Returns the elements that are in either of the arrays but not in their intersection.',
    args: [
      { name: 'array1', type: 'array', description: 'The first array.' },
      { name: 'array2', type: 'array', description: 'The second array.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  toArray: {
    name: 'toArray',
    description: 'Converts a collection into an array of key-value collections.',
    args: [
      { name: 'collection', type: 'object|iterable', description: 'The collection to convert.' },
    ],
    kwargs: [],
    returnType: 'array',
  },
  toCollection: {
    name: 'toCollection',
    description:
      'Converts an array containing objects of key-value pair into a collection (dictionary).',
    args: [
      { name: 'array', type: 'array', description: 'The array to convert.' },
      {
        name: 'key',
        type: 'string',
        description: 'The key in the objects to use as the key in the resulting dictionary.',
      },
      {
        name: 'value',
        type: 'string',
        description: 'The key in the objects to use as the value in the resulting dictionary.',
      },
    ],
    kwargs: [],
    returnType: 'object',
  },
  values_from_list_of_objects: {
    name: 'values_from_list_of_objects',
    description: ' Convert an array of dictionaries to an array of arrays of values..',
    args: [
      { name: 'dicts', type: 'array', description: 'The array of objects to unpack.' },
      {
        name: 'keys',
        type: 'array',
        description:
          ' A list of keys to extract values for. If not provided, uses keys from the first dictionary.',
        default: [],
      },
    ],
    kwargs: [],
    returnType: 'object',
  },
  contains: {
    name: 'contains',
    description: 'Checks if a collection (array or object) contains a specified element or key.',
    args: [
      { name: 'collection', type: 'array|object', description: 'The collection to check.' },
      { name: 'element', type: 'any', description: 'The element or key to check for.' },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  first: {
    name: 'first',
    description: 'Gets the first element of an array.',
    args: [
      { name: 'array', type: 'array', description: 'The array to get the first element from.' },
    ],
    kwargs: [],
    returnType: 'any',
  },
  last: {
    name: 'last',
    description: 'Gets the last element of an array.',
    args: [
      { name: 'array', type: 'array', description: 'The array to get the last element from.' },
    ],
    kwargs: [],
    returnType: 'any',
  },
  length: {
    name: 'length',
    description: 'Returns the length of a collection (array or dictionary).',
    args: [{ name: 'collection', type: 'array|object', description: 'The collection to measure.' }],
    kwargs: [],
    returnType: 'integer',
  },
  keys: {
    name: 'keys',
    description: 'Returns the keys of a dictionary.',
    args: [{ name: 'dictionary', type: 'object', description: 'The dictionary to get keys from.' }],
    kwargs: [],
    returnType: 'array',
  },
  find: {
    name: 'find',
    description:
      'Returns the first element in the collection that satisfies the provided testing function.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to search.' },
      { name: 'function', type: 'function', description: 'The testing function.' },
    ],
    kwargs: [],
    returnType: 'any',
  },
  every: {
    name: 'every',
    description:
      'Tests whether all elements in the collection pass the test implemented by the provided function.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to test.' },
      { name: 'function', type: 'function', description: 'The testing function.' },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  some: {
    name: 'some',
    description:
      'Tests whether at least one element in the collection passes the test implemented by the provided function.',
    args: [
      { name: 'collection', type: 'array', description: 'The collection to test.' },
      { name: 'function', type: 'function', description: 'The testing function.' },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
};

export const OBJECT_HELPERS = {
  title: 'ARRAY & OBJECT',
  description: 'Helpers for manipulating and transforming arrays and objects.',
  prefix: 'object',
  sections: {
    manipulation: {
      title: 'Manipulation',
      description: 'Methods for manipulating arrays and objects.',
      methods: [
        'slice',
        'remove',
        'add',
        'map',
        'shuffle',
        'reverse',
        'flatten',
        'deduplicate',
        'join',
        'merge',
        'sort',
        'distinct',
        'zip_arrays',
        'unzip_array',
        'filter',
        'reduce',
        'group_by',
        'partition',
        'pluck',
        'deep_flatten',
        'update',
        'pop',
        'extend',
        'compact',
        'chunk',
        'intersect',
        'difference',
        'symmetric_difference',
      ],
    },
    conversion: {
      title: 'Conversion',
      description: 'Methods for converting arrays and objects to different formats.',
      methods: ['toArray', 'toCollection', 'values_from_list_of_objects'],
    },
    utility: {
      title: 'Utility',
      description: 'General utility methods for string operations.',
      methods: ['contains', 'first', 'last', 'length', 'keys', 'find', 'every', 'some'],
    },
  },
};

export const STRING_MAPPINGS = {
  uppercase: {
    name: 'uppercase',
    description: 'Converts all characters in the input string to uppercase.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  lowercase: {
    name: 'lowercase',
    description: 'Converts all characters in the input string to lowercase.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  capitalize: {
    name: 'capitalize',
    description: 'Capitalizes the first character of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be capitalized.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  startcase: {
    name: 'startcase',
    description: 'Capitalizes the first character of each word in the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  trim: {
    name: 'trim',
    description: 'Removes whitespace from both ends of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be trimmed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  replace: {
    name: 'replace',
    description:
      'Replaces occurrences of a substring within the input string with a new substring.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string.',
      },
      {
        name: 'old',
        type: 'string',
        description: 'The substring to be replaced.',
      },
      {
        name: 'new',
        type: 'string',
        description: 'The new substring to replace the old one.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  substring: {
    name: 'substring',
    description: 'Extracts a substring from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string.',
      },
      {
        name: 'start',
        type: 'integer',
        description: 'The starting index of the substring.',
      },
    ],
    kwargs: [
      {
        name: 'end',
        type: 'integer',
        description: 'The ending index of the substring (optional).',
      },
    ],
    returnType: 'string',
  },
  stripHTML: {
    name: 'stripHTML',
    description: 'Removes HTML tags from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string containing HTML.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  camelCase: {
    name: 'camelCase',
    description: 'Converts the input string to camelCase.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  snake_case: {
    name: 'snake_case',
    description: 'Converts the input string to snake_case.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  'kebab-case': {
    name: 'kebab-case',
    description: 'Converts the input string to kebab-case.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  reverse: {
    name: 'reverse',
    description: 'Reverses the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be reversed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  padStart: {
    name: 'padStart',
    description: 'Pads the input string on the left to a specified length.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be padded.',
      },
      {
        name: 'length',
        type: 'integer',
        description: 'The total length of the resulting string.',
      },
    ],
    kwargs: [
      {
        name: 'char',
        type: 'string',
        description: 'The character to pad with (default is space).',
      },
    ],
    returnType: 'string',
  },
  padEnd: {
    name: 'padEnd',
    description: 'Pads the input string on the right to a specified length.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be padded.',
      },
      {
        name: 'length',
        type: 'integer',
        description: 'The total length of the resulting string.',
      },
    ],
    kwargs: [
      {
        name: 'char',
        type: 'string',
        description: 'The character to pad with (default is space).',
      },
    ],
    returnType: 'string',
  },
  repeat: {
    name: 'repeat',
    description: 'Repeats the input string a specified number of times.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be repeated.',
      },
      {
        name: 'times',
        type: 'integer',
        description: 'The number of times to repeat the string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  titleCase: {
    name: 'titleCase',
    description: 'Converts the input string to title case.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  swapcase: {
    name: 'swapcase',
    description: 'Swaps the case of each character in the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  center: {
    name: 'center',
    description: 'Centers the input string to a specified length.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be centered.',
      },
      {
        name: 'length',
        type: 'integer',
        description: 'The total length of the resulting string.',
      },
    ],
    kwargs: [
      {
        name: 'char',
        type: 'string',
        description: 'The character to pad with (default is space).',
      },
    ],
    returnType: 'string',
  },
  zfill: {
    name: 'zfill',
    description: 'Pads the input string with zeros on the left to a specified width.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be padded.',
      },
      {
        name: 'width',
        type: 'integer',
        description: 'The total width of the resulting string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  removeWhitespace: {
    name: 'removeWhitespace',
    description: 'Removes all whitespace characters from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be processed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  normalizeWhitespace: {
    name: 'normalizeWhitespace',
    description: 'Normalizes whitespace in the input string to a single space.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be processed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  truncate: {
    name: 'truncate',
    description: "Truncates the input string to a specified length, adding '...' if truncated.",
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be truncated.',
      },
      {
        name: 'length',
        type: 'integer',
        description: 'The maximum length of the resulting string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  prefixLines: {
    name: 'prefixLines',
    description: 'Adds a prefix to each line of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string.',
      },
      {
        name: 'prefix',
        type: 'string',
        description: 'The prefix to add to each line.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  suffixLines: {
    name: 'suffixLines',
    description: 'Adds a suffix to each line of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string.',
      },
      {
        name: 'suffix',
        type: 'string',
        description: 'The suffix to add to each line.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  interleave: {
    name: 'interleave',
    description: 'Interleaves two strings character by character.',
    args: [
      {
        name: 'str1',
        type: 'string',
        description: 'The first input string.',
      },
      {
        name: 'str2',
        type: 'string',
        description: 'The second input string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  encodeURL: {
    name: 'encodeURL',
    description: 'Encodes the input string as a URL.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be encoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  decodeURL: {
    name: 'decodeURL',
    description: 'Decodes a URL-encoded string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The URL-encoded string to be decoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  escapeHTML: {
    name: 'escapeHTML',
    description: 'Escapes HTML characters in the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string containing HTML characters.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  escapeMarkdown: {
    name: 'escapeMarkdown',
    description: 'Escapes Markdown characters in the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string containing Markdown characters.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  base64_encode: {
    name: 'base64_encode',
    description: 'Encodes the input string in Base64.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be encoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  base64_decode: {
    name: 'base64_decode',
    description: 'Decodes a Base64-encoded string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The Base64-encoded string to be decoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  rot13: {
    name: 'rot13',
    description: 'Encodes the input string using ROT13.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be encoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  urlSafeBase64Encode: {
    name: 'urlSafeBase64Encode',
    description: 'Encodes the input string in URL-safe Base64.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be encoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  urlSafeBase64Decode: {
    name: 'urlSafeBase64Decode',
    description: 'Decodes a URL-safe Base64-encoded string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The URL-safe Base64-encoded string to be decoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  md5: {
    name: 'md5',
    description: 'Generates an MD5 hash of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be hashed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  sha1: {
    name: 'sha1',
    description: 'Generates a SHA-1 hash of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be hashed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  sha256: {
    name: 'sha256',
    description: 'Generates a SHA-256 hash of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be hashed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  sha512: {
    name: 'sha512',
    description: 'Generates a SHA-512 hash of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be hashed.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryXOR: {
    name: 'binaryXOR',
    description: 'Performs a binary XOR operation on two binary strings.',
    args: [
      {
        name: 'str1',
        type: 'string',
        description: 'The first binary string.',
      },
      {
        name: 'str2',
        type: 'string',
        description: 'The second binary string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  invertBinary: {
    name: 'invertBinary',
    description: 'Inverts the bits in the input binary string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input binary string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  hexEncode: {
    name: 'hexEncode',
    description: 'Encodes the input string as hexadecimal.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be encoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  hexDecode: {
    name: 'hexDecode',
    description: 'Decodes a hexadecimal-encoded string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The hexadecimal-encoded string to be decoded.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  isNumeric: {
    name: 'isNumeric',
    description: 'Checks if the input string is numeric.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isAlpha: {
    name: 'isAlpha',
    description: 'Checks if the input string contains only alphabetic characters.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isAlphanumeric: {
    name: 'isAlphanumeric',
    description: 'Checks if the input string contains only alphanumeric characters.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isLower: {
    name: 'isLower',
    description: 'Checks if the input string contains only lowercase characters.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isUpper: {
    name: 'isUpper',
    description: 'Checks if the input string contains only uppercase characters.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isPrintable: {
    name: 'isPrintable',
    description: 'Checks if the input string contains only printable characters.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isValidEmail: {
    name: 'isValidEmail',
    description: 'Checks if the input string is a valid email address.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isValidURL: {
    name: 'isValidURL',
    description: 'Checks if the input string is a valid URL.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isValidIPv4: {
    name: 'isValidIPv4',
    description: 'Checks if the input string is a valid IPv4 address.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isValidIPv6: {
    name: 'isValidIPv6',
    description: 'Checks if the input string is a valid IPv6 address.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isDigit: {
    name: 'isDigit',
    description: 'Checks if the input string contains only digits.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isDate: {
    name: 'isDate',
    description: 'Checks if the input string is a valid date in the format YYYY-MM-DD.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isTime: {
    name: 'isTime',
    description: 'Checks if the input string is a valid time in the format HH:MM:SS.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isDateTime: {
    name: 'isDateTime',
    description:
      'Checks if the input string is a valid datetime in the format YYYY-MM-DDTHH:MM:SS.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isHexColor: {
    name: 'isHexColor',
    description: 'Checks if the input string is a valid hexadecimal color code.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isCreditCard: {
    name: 'isCreditCard',
    description: 'Checks if the input string is a valid credit card number.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isSSN: {
    name: 'isSSN',
    description: 'Checks if the input string is a valid Social Security Number (SSN).',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  isPostalCode: {
    name: 'isPostalCode',
    description: 'Checks if the input string is a valid postal code.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  replaceAll: {
    name: 'replaceAll',
    description:
      'Replaces all occurrences of a pattern in the input string with a replacement string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be processed.',
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'The regex pattern to search for.',
      },
      {
        name: 'repl',
        type: 'string',
        description: 'The replacement string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  findall: {
    name: 'findall',
    description: 'Finds all occurrences of a pattern in the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be searched.',
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'The regex pattern to search for.',
      },
    ],
    kwargs: [],
    returnType: 'array',
  },
  splitRegex: {
    name: 'splitRegex',
    description: 'Splits the input string by occurrences of a pattern.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be split.',
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'The regex pattern to split by.',
      },
    ],
    kwargs: [],
    returnType: 'array',
  },
  match: {
    name: 'match',
    description: 'Checks if the input string matches a pattern.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'The regex pattern to match.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  extractEmails: {
    name: 'extractEmails',
    description: 'Extracts all email addresses from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract email addresses.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractURLs: {
    name: 'extractURLs',
    description: 'Extracts all URLs from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract URLs.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractIPs: {
    name: 'extractIPs',
    description: 'Extracts all IPv4 addresses from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract IPv4 addresses.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractHashtags: {
    name: 'extractHashtags',
    description: 'Extracts all hashtags from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract hashtags.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractMentions: {
    name: 'extractMentions',
    description: 'Extracts all mentions from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract mentions.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractDates: {
    name: 'extractDates',
    description: 'Extracts all dates in YYYY-MM-DD format from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract dates.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractTimes: {
    name: 'extractTimes',
    description: 'Extracts all times in HH:MM:SS format from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract times.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractNumbers: {
    name: 'extractNumbers',
    description: 'Extracts all numbers from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract numbers.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractWords: {
    name: 'extractWords',
    description: 'Extracts all words from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract words.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractSentences: {
    name: 'extractSentences',
    description: 'Extracts all sentences from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract sentences.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractCurrencyValues: {
    name: 'extractCurrencyValues',
    description: 'Extracts all currency values from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract currency values.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractPhoneNumbers: {
    name: 'extractPhoneNumbers',
    description: 'Extracts all phone numbers from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract phone numbers.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractCreditCardNumbers: {
    name: 'extractCreditCardNumbers',
    description: 'Extracts all credit card numbers from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract credit card numbers.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractISBNs: {
    name: 'extractISBNs',
    description: 'Extracts all ISBNs from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract ISBNs.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractSSNs: {
    name: 'extractSSNs',
    description: 'Extracts all SSNs from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract SSNs.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractEmailDomains: {
    name: 'extractEmailDomains',
    description: 'Extracts all email domains from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract email domains.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractIPv4Addresses: {
    name: 'extractIPv4Addresses',
    description: 'Extracts all IPv4 addresses from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract IPv4 addresses.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractIPv6Addresses: {
    name: 'extractIPv6Addresses',
    description: 'Extracts all IPv6 addresses from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract IPv6 addresses.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractHexColors: {
    name: 'extractHexColors',
    description: 'Extracts all hex color codes from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract hex color codes.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractHTMLTags: {
    name: 'extractHTMLTags',
    description: 'Extracts all HTML tags from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract HTML tags.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractScriptBlocks: {
    name: 'extractScriptBlocks',
    description: 'Extracts all script blocks from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract script blocks.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractStyleBlocks: {
    name: 'extractStyleBlocks',
    description: 'Extracts all style blocks from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract style blocks.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractFunctionNames: {
    name: 'extractFunctionNames',
    description: 'Extracts all function names from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract function names.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractClassNames: {
    name: 'extractClassNames',
    description: 'Extracts all class names from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract class names.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractIDs: {
    name: 'extractIDs',
    description: 'Extracts all IDs from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract IDs.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractURLParameters: {
    name: 'extractURLParameters',
    description: 'Extracts all URL parameters from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract URL parameters.',
      },
    ],
    kwargs: [],
    returnType: 'array of arrays',
  },
  extractPostalCodes: {
    name: 'extractPostalCodes',
    description: 'Extracts all postal codes from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract postal codes.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractUsernames: {
    name: 'extractUsernames',
    description: 'Extracts all usernames from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract usernames.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  extractGUIDs: {
    name: 'extractGUIDs',
    description: 'Extracts all GUIDs from the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string from which to extract GUIDs.',
      },
    ],
    kwargs: [],
    returnType: 'array<string>',
  },
  startswith: {
    name: 'startswith',
    description: 'Checks if the input string starts with the specified prefix.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
      {
        name: 'prefix',
        type: 'string',
        description: 'The prefix to check for.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  endswith: {
    name: 'endswith',
    description: 'Checks if the input string ends with the specified suffix.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
      {
        name: 'suffix',
        type: 'string',
        description: 'The suffix to check for.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  countSubstr: {
    name: 'countSubstr',
    description: 'Counts the occurrences of a substring within the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
      {
        name: 'substr',
        type: 'string',
        description: 'The substring to count.',
      },
    ],
    kwargs: [],
    returnType: 'integer',
  },
  contains: {
    name: 'contains',
    description: 'Checks if the input string contains the specified substring.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
      {
        name: 'substr',
        type: 'string',
        description: 'The substring to check for.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  split: {
    name: 'split',
    description: 'Splits the input string by the specified separator.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be split.',
      },
    ],
    kwargs: [
      {
        name: 'sep',
        type: 'string',
        description: 'The separator to use for splitting. If not provided, splits by whitespace.',
        default: null,
      },
    ],
    returnType: 'array',
  },
  indexOf: {
    name: 'indexOf',
    description: 'Finds the first occurrence of the specified substring in the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be checked.',
      },
      {
        name: 'substr',
        type: 'string',
        description: 'The substring to find.',
      },
    ],
    kwargs: [],
    returnType: 'integer',
  },
  length: {
    name: 'length',
    description: 'Returns the length of the input string.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string.',
      },
    ],
    kwargs: [],
    returnType: 'integer',
  },
  fromBinary: {
    name: 'fromBinary',
    description: 'Converts a binary string to its ASCII representation.',
    args: [
      {
        name: 'binaryStr',
        type: 'string',
        description: 'The binary string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  toBinary: {
    name: 'toBinary',
    description: 'Converts a string to its binary representation.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  stringToBytes: {
    name: 'stringToBytes',
    description: 'Converts a string to a bytes object.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'bytes',
  },
  bytesToString: {
    name: 'bytesToString',
    description: 'Converts a bytes object to a string.',
    args: [
      {
        name: 'bytesObj',
        type: 'bytes',
        description: 'The bytes object to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  toString: {
    name: 'toString',
    description: 'Converts any input to its string representation.',
    args: [
      {
        name: 'input',
        type: 'any',
        description: 'The input to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  stringToHex: {
    name: 'stringToHex',
    description: 'Converts a string to its hexadecimal representation.',
    args: [
      {
        name: 'str',
        type: 'string',
        description: 'The input string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  hexToString: {
    name: 'hexToString',
    description: 'Converts a hexadecimal string to its ASCII representation.',
    args: [
      {
        name: 'hexStr',
        type: 'string',
        description: 'The hexadecimal string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryToHex: {
    name: 'binaryToHex',
    description: 'Converts a binary string to its hexadecimal representation.',
    args: [
      {
        name: 'binaryStr',
        type: 'string',
        description: 'The binary string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  hexToBinary: {
    name: 'hexToBinary',
    description: 'Converts a hexadecimal string to its binary representation.',
    args: [
      {
        name: 'hexStr',
        type: 'string',
        description: 'The hexadecimal string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryToDecimal: {
    name: 'binaryToDecimal',
    description: 'Converts a binary string to its decimal representation.',
    args: [
      {
        name: 'binaryStr',
        type: 'string',
        description: 'The binary string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'integer',
  },
  decimalToBinary: {
    name: 'decimalToBinary',
    description: 'Converts a decimal number to its binary representation.',
    args: [
      {
        name: 'decimal',
        type: 'integer',
        description: 'The decimal number to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryToASCII: {
    name: 'binaryToASCII',
    description: 'Converts a binary string to its ASCII representation.',
    args: [
      {
        name: 'binaryStr',
        type: 'string',
        description: 'The binary string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  ASCIIToBinary: {
    name: 'ASCIIToBinary',
    description: 'Converts an ASCII string to its binary representation.',
    args: [
      {
        name: 'asciiStr',
        type: 'string',
        description: 'The ASCII string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryToUUID: {
    name: 'binaryToUUID',
    description: 'Converts a binary string to its UUID representation.',
    args: [
      {
        name: 'binaryStr',
        type: 'string',
        description: 'The binary string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  UUIDToBinary: {
    name: 'UUIDToBinary',
    description: 'Converts a UUID string to its binary representation.',
    args: [
      {
        name: 'uuidStr',
        type: 'string',
        description: 'The UUID string to be converted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryAdd: {
    name: 'binaryAdd',
    description: 'Adds two binary numbers.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The first binary number.',
      },
      {
        name: 'y',
        type: 'string',
        description: 'The second binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binarySubtract: {
    name: 'binarySubtract',
    description: 'Subtracts the second binary number from the first.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The first binary number.',
      },
      {
        name: 'y',
        type: 'string',
        description: 'The second binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryMultiply: {
    name: 'binaryMultiply',
    description: 'Multiplies two binary numbers.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The first binary number.',
      },
      {
        name: 'y',
        type: 'string',
        description: 'The second binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryDivide: {
    name: 'binaryDivide',
    description: 'Divides the first binary number by the second.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The first binary number.',
      },
      {
        name: 'y',
        type: 'string',
        description: 'The second binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryShiftLeft: {
    name: 'binaryShiftLeft',
    description: 'Shifts the binary number to the left by a specified number of positions.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The binary number.',
      },
      {
        name: 'n',
        type: 'integer',
        description: 'The number of positions to shift.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryShiftRight: {
    name: 'binaryShiftRight',
    description: 'Shifts the binary number to the right by a specified number of positions.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The binary number.',
      },
      {
        name: 'n',
        type: 'integer',
        description: 'The number of positions to shift.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryAND: {
    name: 'binaryAND',
    description: 'Performs a bitwise AND operation on two binary numbers.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The first binary number.',
      },
      {
        name: 'y',
        type: 'string',
        description: 'The second binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryOR: {
    name: 'binaryOR',
    description: 'Performs a bitwise OR operation on two binary numbers.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The first binary number.',
      },
      {
        name: 'y',
        type: 'string',
        description: 'The second binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryNOT: {
    name: 'binaryNOT',
    description: 'Performs a bitwise NOT operation on a binary number.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  validateBinary: {
    name: 'validateBinary',
    description: 'Validates if a string is a binary number.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The string to validate.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  countBits: {
    name: 'countBits',
    description: "Counts the number of '1' bits in a binary number.",
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The binary number.',
      },
    ],
    kwargs: [],
    returnType: 'integer',
  },
  parityCheck: {
    name: 'parityCheck',
    description: "Checks if the number of '1' bits in a binary number is even.",
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The binary number.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
  toggleBits: {
    name: 'toggleBits',
    description: 'Toggles all bits in a binary number.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryComplement: {
    name: 'binaryComplement',
    description: 'Computes the complement of a binary number.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The binary number.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  binaryReduceXOR: {
    name: 'binaryReduceXOR',
    description: 'Performs a reduction XOR operation on a list of binary numbers.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'A space-separated string of binary numbers.',
      },
    ],
    kwargs: [],
    returnType: 'integer',
  },
};

export const STRING_HELPERS = {
  title: 'STRING & BINARY',
  description: 'Helpers for string and binary tranformation, validation and manipulation.',
  prefix: 'string',
  sections: {
    manipulation: {
      title: 'Manipulation',
      description: 'Methods for manipulating strings.',
      methods: [
        'uppercase',
        'lowercase',
        'capitalize',
        'startcase',
        'trim',
        'replace',
        'substring',
        'stripHTML',
        'camelCase',
        'snake_case',
        'kebab-case',
        'reverse',
        'padStart',
        'padEnd',
        'repeat',
        'titleCase',
        'swapcase',
        'center',
        'zfill',
        'removeWhitespace',
        'normalizeWhitespace',
        'truncate',
        'prefixLines',
        'suffixLines',
        'interleave',
      ],
    },
    encoding_decoding: {
      title: 'Encoding/Decoding',
      description: 'Methods for encoding and decoding strings.',
      methods: [
        'encodeURL',
        'decodeURL',
        'escapeHTML',
        'escapeMarkdown',
        'base64_encode',
        'base64_decode',
        'rot13',
        'urlSafeBase64Encode',
        'urlSafeBase64Decode',
      ],
    },
    hashing: {
      title: 'Hashing',
      description: 'Methods for hashing strings.',
      methods: ['md5', 'sha1', 'sha256', 'sha512'],
    },
    binary: {
      title: 'Binary',
      description: 'Methods for binary operations.',
      methods: ['binaryXOR', 'invertBinary', 'hexEncode', 'hexDecode'],
    },
    validation: {
      title: 'Validation',
      description: 'Methods for validating various types of input strings.',
      methods: [
        'isNumeric',
        'isAlpha',
        'isAlphanumeric',
        'isLower',
        'isUpper',
        'isPrintable',
        'isValidEmail',
        'isValidURL',
        'isValidIPv4',
        'isValidIPv6',
        'isDigit',
        'isDate',
        'isTime',
        'isDateTime',
        'isHexColor',
        'isCreditCard',
        'isSSN',
        'isPostalCode',
      ],
    },
    regex: {
      title: 'Regular Expressions',
      description: 'Methods for performing operations using regular expressions.',
      methods: ['replaceAll', 'findall', 'splitRegex', 'match'],
    },
    regex_extraction: {
      title: 'Regex Extraction',
      description:
        'Methods for extracting specific patterns from strings using regular expressions.',
      methods: [
        'extractEmails',
        'extractURLs',
        'extractIPs',
        'extractHashtags',
        'extractMentions',
        'extractDates',
        'extractTimes',
        'extractNumbers',
        'extractWords',
        'extractSentences',
        'extractCurrencyValues',
        'extractPhoneNumbers',
        'extractCreditCardNumbers',
        'extractISBNs',
        'extractSSNs',
        'extractEmailDomains',
        'extractIPv4Addresses',
        'extractIPv6Addresses',
        'extractHexColors',
        'extractHTMLTags',
        'extractScriptBlocks',
        'extractStyleBlocks',
        'extractFunctionNames',
        'extractClassNames',
        'extractIDs',
        'extractURLParameters',
        'extractPostalCodes',
        'extractUsernames',
        'extractGUIDs',
      ],
    },
    utility: {
      title: 'Utility',
      description: 'General utility methods for string operations.',
      methods: ['startswith', 'endswith', 'countSubstr', 'contains', 'split', 'indexOf', 'length'],
    },
    conversion: {
      title: 'Conversion',
      description: 'Methods for converting strings and binary to different formats and viceversa.',
      methods: [
        'fromBinary',
        'toBinary',
        'stringToBytes',
        'bytesToString',
        'toString',
        'stringToHex',
        'hexToString',
        'binaryToHex',
        'hexToBinary',
        'binaryToDecimal',
        'decimalToBinary',
        'binaryToASCII',
        'ASCIIToBinary',
        'binaryToUUID',
        'UUIDToBinary',
      ],
    },
    binary_utilities: {
      title: 'Binary Utilities',
      description: 'Methods for performing various binary operations.',
      methods: [
        'binaryAdd',
        'binarySubtract',
        'binaryMultiply',
        'binaryDivide',
        'binaryShiftLeft',
        'binaryShiftRight',
        'binaryAND',
        'binaryOR',
        'binaryNOT',
        'validateBinary',
        'countBits',
        'parityCheck',
        'toggleBits',
        'binaryComplement',
        'binaryReduceXOR',
      ],
    },
  },
};

export const MATH_MAPPINGS = {
  add: {
    name: 'add',
    description: 'Adds multiple numbers together.',
    args: [
      {
        name: 'args',
        type: 'array',
        description: 'Numbers to be added.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  subtract: {
    name: 'subtract',
    description: 'Subtracts multiple numbers from the first number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The initial number.',
      },
      {
        name: 'args',
        type: 'array',
        description: 'Numbers to be subtracted.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  multiply: {
    name: 'multiply',
    description: 'Multiplies multiple numbers together.',
    args: [
      {
        name: 'args',
        type: 'array',
        description: 'Numbers to be multiplied.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  divide: {
    name: 'divide',
    description: 'Divides the first number by the product of the remaining numbers.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The initial number.',
      },
      {
        name: 'args',
        type: 'array',
        description: 'Numbers to divide by.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  mod: {
    name: 'mod',
    description: 'Computes the modulus of two numbers.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The dividend.',
      },
      {
        name: 'y',
        type: 'number',
        description: 'The divisor.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  power: {
    name: 'power',
    description: 'Raises a number to the power of another number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The base number.',
      },
      {
        name: 'y',
        type: 'number',
        description: 'The exponent.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  sum: {
    name: 'sum',
    description: 'Calculates the sum of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to sum.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  average: {
    name: 'average',
    description: 'Calculates the average of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to average.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  max: {
    name: 'max',
    description: 'Finds the maximum value among the given numbers.',
    args: [
      {
        name: 'args',
        type: 'array',
        description: 'Numbers to find the maximum of.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  min: {
    name: 'min',
    description: 'Finds the minimum value among the given numbers.',
    args: [
      {
        name: 'args',
        type: 'array',
        description: 'Numbers to find the minimum of.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  variance: {
    name: 'variance',
    description: 'Calculates the variance of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate variance.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  stdev: {
    name: 'stdev',
    description: 'Calculates the standard deviation of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate standard deviation.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  median: {
    name: 'median',
    description: 'Calculates the median of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate median.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  mode: {
    name: 'mode',
    description: 'Calculates the mode of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate mode.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  harmonic_mean: {
    name: 'harmonic_mean',
    description: 'Calculates the harmonic mean of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate harmonic mean.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  geometric_mean: {
    name: 'geometric_mean',
    description: 'Calculates the geometric mean of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate geometric mean.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  quantiles: {
    name: 'quantiles',
    description: 'Calculates the quantiles of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate quantiles.',
      },
    ],
    kwargs: [
      {
        name: 'n',
        type: 'number',
        description: 'Number of quantiles to compute.',
      },
    ],
    returnType: 'array',
  },
  percentile: {
    name: 'percentile',
    description: 'Calculates the nth percentile of a list of numbers.',
    args: [
      {
        name: 'numbers',
        type: 'array',
        description: 'List of numbers to calculate percentile.',
      },
      {
        name: 'percentile',
        type: 'number',
        description: 'The percentile to calculate.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  sin: {
    name: 'sin',
    description: 'Calculates the sine of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The angle in radians.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  cos: {
    name: 'cos',
    description: 'Calculates the cosine of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The angle in radians.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  tan: {
    name: 'tan',
    description: 'Calculates the tangent of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The angle in radians.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  asin: {
    name: 'asin',
    description: 'Calculates the arcsine of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose arcsine is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  acos: {
    name: 'acos',
    description: 'Calculates the arccosine of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose arccosine is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  atan: {
    name: 'atan',
    description: 'Calculates the arctangent of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose arctangent is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  sinh: {
    name: 'sinh',
    description: 'Calculates the hyperbolic sine of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose hyperbolic sine is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  cosh: {
    name: 'cosh',
    description: 'Calculates the hyperbolic cosine of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose hyperbolic cosine is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  tanh: {
    name: 'tanh',
    description: 'Calculates the hyperbolic tangent of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose hyperbolic tangent is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  degrees: {
    name: 'degrees',
    description: 'Converts an angle from radians to degrees.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The angle in radians.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  radians: {
    name: 'radians',
    description: 'Converts an angle from degrees to radians.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The angle in degrees.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  log: {
    name: 'log',
    description: 'Calculates the logarithm of a number with a specified base.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose logarithm is to be calculated.',
      },
    ],
    kwargs: [
      {
        name: 'base',
        type: 'number',
        description: 'The base of the logarithm.',
      },
    ],
    returnType: 'number',
  },
  log10: {
    name: 'log10',
    description: 'Calculates the base-10 logarithm of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose base-10 logarithm is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  log2: {
    name: 'log2',
    description: 'Calculates the base-2 logarithm of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose base-2 logarithm is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  exp: {
    name: 'exp',
    description: 'Calculates the exponential of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose exponential is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  sqrt: {
    name: 'sqrt',
    description: 'Calculates the square root of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose square root is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  cbrt: {
    name: 'cbrt',
    description: 'Calculates the cube root of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The value whose cube root is to be calculated.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  parseNumber: {
    name: 'parseNumber',
    description: 'Parses a string to a number.',
    args: [
      {
        name: 'x',
        type: 'string',
        description: 'The string to be parsed.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  formatNumber: {
    name: 'formatNumber',
    description: 'Formats a number according to a specified format.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to be formatted.',
      },
    ],
    kwargs: [
      {
        name: 'fmt',
        type: 'string',
        description: 'The format to apply.',
      },
    ],
    returnType: 'string',
  },
  round: {
    name: 'round',
    description: 'Rounds a number to a specified number of decimal places.',
    args: [
      {
        name: 'number',
        type: 'number',
        description: 'The number to be rounded.',
      },
    ],
    kwargs: [
      {
        name: 'ndigits',
        type: 'number',
        description: 'The number of decimal places to round to.',
      },
    ],
    returnType: 'number',
  },
  ceil: {
    name: 'ceil',
    description: 'Rounds a number up to the nearest integer.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to be rounded up.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  floor: {
    name: 'floor',
    description: 'Rounds a number down to the nearest integer.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to be rounded down.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  random: {
    name: 'random',
    description: 'Generates a random number between 0 and 1.',
    args: [],
    kwargs: [],
    returnType: 'number',
  },
  pi: {
    name: 'pi',
    description: 'Returns the value of pi.',
    args: [],
    kwargs: [],
    returnType: 'number',
  },
  factorial: {
    name: 'factorial',
    description: 'Calculates the factorial of a number.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to calculate the factorial of.',
      },
    ],
    kwargs: [],
    returnType: 'number',
  },
  is_prime: {
    name: 'is_prime',
    description: 'Checks if a number is prime.',
    args: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to check for primality.',
      },
    ],
    kwargs: [],
    returnType: 'boolean',
  },
};

export const MATH_HELPERS = {
  title: 'MATH',
  description: 'Helpers for math formulas, operations and number parsing.',
  prefix: 'math',
  sections: {
    arithmetic: {
      title: 'Basic Arithmetic Operations',
      description:
        'Includes fundamental arithmetic operations such as addition, subtraction, multiplication, division, modulus, and exponentiation.',
      methods: ['add', 'subtract', 'multiply', 'divide', 'mod', 'power'],
    },
    statistical: {
      title: 'Statistical Operations',
      description: 'Crucial methods for data analysis and interpretation',
      methods: [
        'sum',
        'average',
        'max',
        'min',
        'variance',
        'stdev',
        'median',
        'mode',
        'harmonic_mean',
        'geometric_mean',
        'quantiles',
        'percentile',
      ],
    },
    trigonometric: {
      title: 'Trigonometric Functions',
      description:
        'Methods for trigonometric calculations, including sine, cosine, tangent, and their hyperbolic counterparts. It also includes methods for converting between degrees and radians. These functions are vital for applications in geometry, physics, and engineering.',
      methods: [
        'sin',
        'cos',
        'tan',
        'asin',
        'acos',
        'atan',
        'sinh',
        'cosh',
        'tanh',
        'degrees',
        'radians',
      ],
    },
    logarithmic_exponential: {
      title: 'Logarithmic and Exponential Functions',
      description:
        'Methods important for growth modeling, decay processes, and various scientific computations.',
      methods: ['log', 'log10', 'log2', 'exp', 'sqrt', 'cbrt'],
    },
    formatting_parsing: {
      title: 'Number Formatting and Parsing',
      description: 'Methods useful for data presentation and manipulation.',
      methods: ['parseNumber', 'formatNumber', 'round', 'ceil', 'floor'],
    },
    random_constants: {
      title: 'Random and Constants',
      description:
        'Methods for generating random numbers and accessing mathematical constants such as pi. These functions are essential for simulations, random sampling, and various probabilistic computations.',
      methods: ['random', 'pi'],
    },
    misc: {
      title: 'Miscellaneous',
      description: 'Mathematical methods that do not fit into the other categories.',
      methods: ['factorial', 'is_prime'],
    },
  },
};

export const DATE_MAPPINGS = {
  addSeconds: {
    name: 'addSeconds',
    description: 'Adds a specified number of seconds to a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'seconds',
        type: 'float',
        description: 'The number of seconds to add.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  addMinutes: {
    name: 'addMinutes',
    description: 'Adds a specified number of minutes to a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'minutes',
        type: 'float',
        description: 'The number of minutes to add.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  addHours: {
    name: 'addHours',
    description: 'Adds a specified number of hours to a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'hours',
        type: 'float',
        description: 'The number of hours to add.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  addDays: {
    name: 'addDays',
    description: 'Adds a specified number of days to a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'days',
        type: 'float',
        description: 'The number of days to add.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  addMonths: {
    name: 'addMonths',
    description: 'Adds a specified number of months to a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'months',
        type: 'float',
        description: 'The number of months to add.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  addYears: {
    name: 'addYears',
    description: 'Adds a specified number of years to a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'years',
        type: 'float',
        description: 'The number of years to add.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  setSecond: {
    name: 'setSecond',
    description: 'Sets the second component of a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'second',
        type: 'int',
        description: 'The second value to set.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  setMinute: {
    name: 'setMinute',
    description: 'Sets the minute component of a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'minute',
        type: 'int',
        description: 'The minute value to set.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  setHour: {
    name: 'setHour',
    description: 'Sets the hour component of a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'hour',
        type: 'int',
        description: 'The hour value to set.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  setDay: {
    name: 'setDay',
    description: 'Sets the day component of a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'day',
        type: 'int',
        description: 'The day value to set.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  setDate: {
    name: 'setDate',
    description: 'Sets the date (year, month, day) of a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'date',
        type: 'datetime',
        description: 'The date value to set.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  setMonth: {
    name: 'setMonth',
    description: 'Sets the month component of a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'month',
        type: 'int',
        description: 'The month value to set.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  setYear: {
    name: 'setYear',
    description: 'Sets the year component of a datetime object.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be modified.',
      },
      {
        name: 'year',
        type: 'int',
        description: 'The year value to set.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  formatDate: {
    name: 'formatDate',
    description: 'Formats a datetime object into a string according to a specified format.',
    args: [
      {
        name: 'datetime_obj',
        type: 'datetime',
        description: 'The datetime object to be formatted.',
      },
      {
        name: 'format_str',
        type: 'string',
        description: 'The format string.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  parseDate: {
    name: 'parseDate',
    description: 'Parses a datetime string into a datetime object using multiple formats.',
    args: [
      {
        name: 'date_str',
        type: 'string',
        description: 'The datetime string to be parsed.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  timestamp: {
    name: 'timestamp',
    description: 'Returns the current timestamp.',
    args: [],
    kwargs: [],
    returnType: 'float',
  },
  now: {
    name: 'now',
    description: 'Returns the current datetime.',
    args: [],
    kwargs: [],
    returnType: 'datetime',
  },
};

export const DATE_HELPERS = {
  title: 'DATE AND TIME',
  description: 'Helpers for datetime tranformation, validation and manipulation.',
  prefix: 'date',
  sections: {
    manipulation: {
      title: 'Manipulation & Transformation',
      description: 'Methods fortranforming an dmanipulating datetime.',
      methods: [
        'addSeconds',
        'addMinutes',
        'addHours',
        'addDays',
        'addMonths',
        'addYears',
        'setSecond',
        'setMinute',
        'setHour',
        'setDay',
        'setDate',
        'setMonth',
        'setYear',
      ],
    },
    formatting: {
      title: 'Formatting & Parsing',
      description:
        'Methods for formatting datetime objects into strings and parsing strings into datetime objects.',
      methods: ['formatDate', 'parseDate'],
    },
    utility: {
      title: 'Utility',
      description: 'Methods for parsing datetime strings and ensuring valid datetime objects.',
      methods: ['timestamp', 'now'],
    },
  },
};

export const RFC_MAPPINGS = {
  format_email_rfc2822: {
    name: 'format_email_rfc2822',
    description: 'Formats an email address according to RFC 2822.',
    args: [
      {
        name: 'email_raw',
        type: 'object',
        description: 'The name of the email recipient.',
        required: ['to', 'subject', 'body'],
        properties: {
          to: {
            type: 'string',
            format: 'email',
            description: 'Email address of the recipient.',
          },
          body: {
            type: 'string',
            description: 'The body content of the email.',
          },
          from: {
            type: 'string',
            format: 'email',
            description:
              "Email address of the sender. If not provided, the authenticated user's email will be used.",
          },
          subject: {
            type: 'string',
            description: 'Subject of the email.',
          },
          contentType: {
            enum: ['text/plain', 'text/html'],
            type: 'string',
            description: "Content type of the email body. Defaults to 'text/plain'.",
          },
        },
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  parse_email_rfc2822: {
    name: 'parse_email_rfc2822',
    description: 'Parses an RFC 2822 formatted email address.',
    args: [
      {
        name: 'email_str',
        type: 'string',
        description: 'The RFC 2822 formatted email address.',
      },
    ],
    kwargs: [],
    returnType: 'array',
  },
  format_url_rfc3986: {
    name: 'format_url_rfc3986',
    description: 'Formats a URL according to RFC 3986.',
    args: [
      {
        name: 'scheme',
        type: 'string',
        description: "The URL scheme (e.g., 'http', 'https').",
      },
      {
        name: 'netloc',
        type: 'string',
        description: 'The network location part of the URL.',
      },
      {
        name: 'path',
        type: 'string',
        description: 'The path component of the URL.',
        default: '',
      },
      {
        name: 'params',
        type: 'string',
        description: 'The parameters for the URL.',
        default: '',
      },
      {
        name: 'query',
        type: 'string',
        description: 'The query string for the URL.',
        default: '',
      },
      {
        name: 'fragment',
        type: 'string',
        description: 'The fragment identifier for the URL.',
        default: '',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  parse_url_rfc3986: {
    name: 'parse_url_rfc3986',
    description: 'Parses an RFC 3986 formatted URL.',
    args: [
      {
        name: 'url',
        type: 'string',
        description: 'The RFC 3986 formatted URL.',
      },
    ],
    kwargs: [],
    returnType: 'ParseResult',
  },
  format_datetime_rfc3339: {
    name: 'format_datetime_rfc3339',
    description: 'Formats a datetime object according to RFC 3339.',
    args: [
      {
        name: 'dt',
        type: 'datetime',
        description: 'The datetime object to be formatted.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  parse_datetime_rfc3339: {
    name: 'parse_datetime_rfc3339',
    description: 'Parses an RFC 3339 formatted datetime string.',
    args: [
      {
        name: 'dt_str',
        type: 'string',
        description: 'The RFC 3339 formatted datetime string.',
      },
    ],
    kwargs: [],
    returnType: 'datetime',
  },
  format_uuid_rfc4122: {
    name: 'format_uuid_rfc4122',
    description: 'Formats a UUID according to RFC 4122.',
    args: [],
    kwargs: [],
    returnType: 'string',
  },
  parse_uuid_rfc4122: {
    name: 'parse_uuid_rfc4122',
    description: 'Parses an RFC 4122 formatted UUID.',
    args: [
      {
        name: 'uuid_str',
        type: 'string',
        description: 'The RFC 4122 formatted UUID.',
      },
    ],
    kwargs: [],
    returnType: 'UUID',
  },
  format_dns_rfc1035: {
    name: 'format_dns_rfc1035',
    description: 'Formats a DNS record according to RFC 1035.',
    args: [
      {
        name: 'name',
        type: 'string',
        description: 'The DNS record name.',
      },
      {
        name: 'ttl',
        type: 'integer',
        description: 'The time-to-live value for the DNS record.',
      },
      {
        name: 'record_class',
        type: 'string',
        description: "The class of the DNS record (e.g., 'IN').",
      },
      {
        name: 'record_type',
        type: 'string',
        description: "The type of the DNS record (e.g., 'A', 'MX').",
      },
      {
        name: 'data',
        type: 'string',
        description: 'The data for the DNS record.',
      },
    ],
    kwargs: [],
    returnType: 'string',
  },
  parse_dns_rfc1035: {
    name: 'parse_dns_rfc1035',
    description: 'Parses an RFC 1035 formatted DNS record.',
    args: [
      {
        name: 'dns_str',
        type: 'string',
        description: 'The RFC 1035 formatted DNS record.',
      },
    ],
    kwargs: [],
    returnType: 'object',
  },
};

export const RFC_HELPERS = {
  title: 'RFC HELPERS',
  description: 'Helpers for formatting and parsing data according to various RFC standards.',
  prefix: 'rfc',
  sections: {
    email: {
      title: 'Email Formatting',
      description: 'Methods for formatting and parsing email addresses according to RFC standards.',
      methods: ['format_email_rfc2822', 'parse_email_rfc2822'],
    },
    url: {
      title: 'URL Formatting',
      description: 'Methods for formatting and parsing URLs according to RFC 3986.',
      methods: ['format_url_rfc3986', 'parse_url_rfc3986'],
    },
    datetime: {
      title: 'Date/Time Formatting',
      description: 'Methods for formatting and parsing datetime objects according to RFC 3339.',
      methods: ['format_datetime_rfc3339', 'parse_datetime_rfc3339'],
    },
    uuid: {
      title: 'UUID Formatting',
      description: 'Methods for formatting and parsing UUIDs according to RFC 4122.',
      methods: ['format_uuid_rfc4122', 'parse_uuid_rfc4122'],
    },
    dns: {
      title: 'DNS Formatting',
      description: 'Methods for formatting and parsing DNS records according to RFC 1035.',
      methods: ['format_dns_rfc1035', 'parse_dns_rfc1035'],
    },
  },
};

export const METHODS = {
  object: OBJECT_MAPPINGS,
  string: STRING_MAPPINGS,
  math: MATH_MAPPINGS,
  date: DATE_MAPPINGS,
  rfc: RFC_MAPPINGS,
};
