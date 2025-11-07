export function paginate(items, page = 1, perPage = 10) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  return { page, perPage, total, pages, items: items.slice(start, start + perPage) };
}


