export const PAGE_SIZE = 20;

export interface PaginatorData {
  paginatedList: any[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface Paginator extends PaginatorData {
  goToPage: (page: number) => any[];
  setPageSize: (numRowsPerPage: number) => void;
}

/**
 * Easily add in-memory Pagination features to a dataset.
 * This wrapper will internally manage pagination settings
 * and publish result page-set of data.
 *
 * @Sample:
 *
 *  // Do not use inside state management/reducers where
 *  // only 'objects' are expected during mutation
 *
 *  const paginator = new DataPaginator<PersonSummary>();
 *
 *  // Later when processing actions:
 *
 *  paginator.goToPage((action as NavigateToPage).page);
 *  const { totalPages, currentPage, paginatedList, pageSize } = paginator;
 *
 *  state = {
 *    ...state,
 *    paginator: {
 *     paginatedList,
 *      currentPage,
 *      totalPages,
 *      pageSize
 *    }
 *  };
 */

export class DataPaginator implements Paginator {
  private _paginatedList: any[] | null;
  private _totalPages = 0;

  get totalCount(): number {
    return this._rawList.length;
  }
  /**
   * Read-only accessor
   */
  get totalPages(): number {
    return this._totalPages;
  }

  /**
   * Read-only accessor to 1-based page marker
   */
  get currentPage(): number {
    return this._currentPage + 1;
  }

  get paginatedList(): any[] {
    return this._paginatedList ? [...this._paginatedList] : [];
  }

  /**
   * Always return immutable list
   */
  get rawList(): any[] {
    return [...this._rawList];
  }

  set rawList(list: any[]) {
    this._rawList = [...(list || [])];
    this._paginatedList = [];
    this._currentPage = -1;

    this.goToPage(1);
  }

  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(val: number) {
    if (val !== this._pageSize) {
      this._currentPage = 1;
      this._paginatedList = [];
      this._pageSize = Math.max(0, Math.round(val));

      this.goToPage(1);
    }
  }

  /**
   * Construct with rawList and options
   */
  constructor(private _rawList: any[] = [], private _pageSize: number = PAGE_SIZE, private _currentPage: number = 1) {
    this._pageSize = Math.max(1, Math.round(this._pageSize));
    this.goToPage(_currentPage);
  }

  /**
   * External users use 1-based values,
   * internal usages maintain 0-based values
   */
  goToPage(page: number): any[] {
    this.updateTotalPages();

    page = Math.min(Math.max(1, page), this._totalPages);

    if (this._totalPages > 0) {
      // Use 0-based page value and force to be in-bounds
      page = Math.min(Math.max(0, Math.floor(page) - 1), this._totalPages - 1);

      if (page > -1) {
        if (page !== this._currentPage || !this._paginatedList) {
          const start = page * this._pageSize;
          const end = start + this._pageSize;

          if (start <= this.rawList.length - 1) {
            this._paginatedList = this.rawList.slice(start, end);
          }

          this._currentPage = page;
        }
      }
    }
    return this._paginatedList as any[];
  }

  /**
   * Needed for the 'Paginator' API
   */
  setPageSize(numRowsPerPage: number) {
    this.pageSize = numRowsPerPage || PAGE_SIZE;
  }

  /**
   * Republish updated total num pages
   */
  private updateTotalPages() {
    this._totalPages = Math.ceil(this._rawList.length / this._pageSize);
    if (!this._totalPages) {
      this._currentPage = -1;
    }
  }
}
