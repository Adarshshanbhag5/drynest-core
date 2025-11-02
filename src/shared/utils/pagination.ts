export function getPaginationOptions(pageNumber: number, pageSize: number) {
  // assume pageNumber starts from 0
  const skip = pageNumber * pageSize;
  const take = pageSize;
  return {
    skip,
    take,
  };
}
