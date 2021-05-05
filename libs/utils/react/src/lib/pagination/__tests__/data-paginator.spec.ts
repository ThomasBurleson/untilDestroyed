import { DataPaginator } from '../data-paginator';

describe('Paginator', function () {
  describe('should initialize', function () {
    it('with empty list', function () {
      const paginator = new DataPaginator();
      expect(paginator.rawList.length).toEqual(0);
      expect(paginator.paginatedList.length).toEqual(0);
      expect(paginator.totalPages).toEqual(0);
      expect(paginator.currentPage).toEqual(0);
    });

    it('with valid list', function () {
      const rawList = buildRawList();
      const paginator = new DataPaginator(rawList);

      expect(rawList.length).toEqual(3);
      expect(paginator.rawList.length).toBe(3);

      expect(paginator.paginatedList.length).toBe(3);
      expect(paginator.totalPages).toBe(1);
      expect(paginator.currentPage).toBe(1);
    });
  });

  describe('should paginate list', function () {
    it('with custom pageSize', function () {
      const paginator = new DataPaginator(buildRawList(), 1);

      expect(paginator.rawList.length).toBe(3);
      expect(paginator.paginatedList.length).toBe(1);
      expect(paginator.totalPages).toBe(3);
      expect(paginator.currentPage).toBe(1);
    });

    it('with page selected', function () {
      const paginator = new DataPaginator(buildRawList(), 1, 2);

      expect(paginator.rawList.length).toBe(3);
      expect(paginator.paginatedList.length).toBe(1);
      expect(paginator.totalPages).toBe(3);

      expect(paginator.currentPage).toBe(2);
      expect(paginator.paginatedList[0]).toBe(2);
    });

    it('with invalid page sizes', function () {
      [-1000, -1, 0].forEach((pageSize) => {
        const paginator = new DataPaginator(buildRawList(), pageSize);

        expect(paginator.rawList.length).toBe(3);
        expect(paginator.paginatedList.length).toBe(1);
        expect(paginator.totalPages).toBe(3);
        expect(paginator.currentPage).toBe(1);
      });

      [2.5, 10000].forEach((pageSize) => {
        const paginator = new DataPaginator(buildRawList(), pageSize);

        expect(paginator.rawList.length).toBe(3);
        expect(paginator.paginatedList.length).toBe(3);
        expect(paginator.totalPages).toBe(1);
        expect(paginator.currentPage).toBe(1);
      });
    });
  });

  describe('update existing paginated list', function () {
    it('with larger rawList', function () {
      const paginator = new DataPaginator([], 2);

      expect(paginator.rawList.length).toBe(0);
      expect(paginator.paginatedList.length).toBe(0);
      expect(paginator.totalPages).toBe(0);
      expect(paginator.currentPage).toBe(0);

      paginator.rawList = buildRawList();

      expect(paginator.rawList.length).toBe(3);
      expect(paginator.paginatedList.length).toBe(2);
      expect(paginator.totalPages).toBe(2);
      expect(paginator.currentPage).toBe(1);
    });

    it('with smaller rawList', function () {
      const paginator = new DataPaginator(buildRawList(), 2);

      expect(paginator.rawList.length).toBe(3);
      expect(paginator.paginatedList.length).toBe(2);
      expect(paginator.totalPages).toBe(2);
      expect(paginator.currentPage).toBe(1);

      paginator.goToPage(2);

      expect(paginator.totalPages).toBe(2);
      expect(paginator.currentPage).toBe(2);

      paginator.rawList = [13];

      expect(paginator.rawList.length).toBe(1);
      expect(paginator.paginatedList.length).toBe(1);
      expect(paginator.totalPages).toBe(1);
      expect(paginator.currentPage).toBe(1);
    });

    it('with other rawLists', function () {
      [[], null, undefined].forEach((rawList) => {
        const paginator = new DataPaginator(buildRawList(), 2);

        expect(paginator.rawList.length).toBe(3);
        expect(paginator.paginatedList.length).toBe(2);
        expect(paginator.totalPages).toBe(2);
        expect(paginator.currentPage).toBe(1);

        paginator.rawList = rawList || [];

        expect(paginator.rawList.length).toBe(0);
        expect(paginator.paginatedList.length).toBe(0);
        expect(paginator.totalPages).toBe(0);
        expect(paginator.currentPage).toBe(0);
      });
    });
  });

  describe('paginate to another page', function () {
    it('with selected page in bounds', function () {
      const TOTAL_ITEMS = 9;
      const paginator = new DataPaginator(buildRawList(TOTAL_ITEMS), 2);

      expect(paginator.rawList.length).toBe(TOTAL_ITEMS);
      expect(paginator.paginatedList.length).toBe(2);
      expect(paginator.totalPages).toBe(5);
      expect(paginator.currentPage).toBe(1);

      // Iterate each page
      [1, 2, 3, 4].forEach((page) => {
        paginator.goToPage(page);

        expect(paginator.rawList.length).toBe(TOTAL_ITEMS);
        expect(paginator.paginatedList.length).toBe(2);
        expect(paginator.totalPages).toBe(5);
        expect(paginator.currentPage).toBe(page);
        expect(paginator.paginatedList[0]).toBe(page * 2 - 1);
      });

      // Goto last page
      paginator.goToPage(5);

      expect(paginator.rawList.length).toBe(TOTAL_ITEMS);
      expect(paginator.paginatedList.length).toBe(1);
      expect(paginator.totalPages).toBe(5);
      expect(paginator.currentPage).toBe(5);
      expect(paginator.paginatedList[0]).toBe(9);
    });

    it('with selected page smaller than bounds', function () {
      const paginator = new DataPaginator(buildRawList(9), 2);

      expect(paginator.rawList.length).toBe(9);
      expect(paginator.paginatedList.length).toBe(2);
      expect(paginator.totalPages).toBe(5);
      expect(paginator.currentPage).toBe(1);

      // Iterate each page
      [0, -1, -10].forEach((page) => {
        paginator.goToPage(page);

        expect(paginator.rawList.length).toBe(9);
        expect(paginator.paginatedList.length).toBe(2);
        expect(paginator.totalPages).toBe(5);
        expect(paginator.currentPage).toBe(1);
        expect(paginator.paginatedList[0]).toBe(1);
      });
    });

    it('with selected page larger than bounds', function () {
      const paginator = new DataPaginator(buildRawList(10), 2);

      expect(paginator.rawList.length).toBe(10);
      expect(paginator.paginatedList.length).toBe(2);
      expect(paginator.totalPages).toBe(5);
      expect(paginator.currentPage).toBe(1);

      // Iterate each page
      [6, 10, 100].forEach((page) => {
        paginator.goToPage(page);

        expect(paginator.rawList.length).toBe(10);
        expect(paginator.paginatedList.length).toBe(2);
        expect(paginator.totalPages).toBe(5);
        expect(paginator.currentPage).toBe(5);
        expect(paginator.paginatedList[0]).toBe(9);
      });
    });
  });
});

/**
 * Factory method to Build list of numbers
 */
function buildRawList(totalCount = 3) {
  return new Array(totalCount).fill(null).map((_, index) => index + 1);
}
