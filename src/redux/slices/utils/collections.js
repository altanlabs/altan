const makeUrlFriendly = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const paginateCollection = (collection, byName = false) => {
  const result = {
    allIds: [],
    byId: {},
  };
  if (byName) {
    result.byName = {};
  }

  if (!collection) {
    return result;
  }

  const { items, has_next_page, next_cursor } = collection;

  if (Array.isArray(items)) {
    // Initialize a map to keep track of name occurrences
    const nameOccurrences = {};

    items.forEach((item) => {
      if (item && item.id) {
        result.allIds.push(item.id);
        result.byId[item.id] = item;

        if (item.name && byName) {
          // Make the item name URL friendly
          let urlFriendlyName = makeUrlFriendly(item.name);

          // Check if the name has already been used
          if (nameOccurrences[urlFriendlyName]) {
            // If the name is repeated, append "-<item.id.slice(0, 5)>" to the end
            urlFriendlyName += `-${item.id.slice(0, 5)}`;
          }

          // Update the nameOccurrences map
          nameOccurrences[urlFriendlyName] = (nameOccurrences[urlFriendlyName] || 0) + 1;

          // Use the potentially modified name as the key
          result.byName[urlFriendlyName] = item.id;
          result.byId[item.id]._byName = urlFriendlyName;
        }
      }
    });
  }

  if (has_next_page !== null || next_cursor !== null) {
    result.paginationInfo = {
      hasNextPage: false,
      cursor: null,
    };
    if (has_next_page !== null) {
      result.paginationInfo.hasNextPage = has_next_page;
    }
    if (next_cursor !== null) {
      result.paginationInfo.cursor = next_cursor;
    }
  }
  return result;
};

export { paginateCollection, makeUrlFriendly };
