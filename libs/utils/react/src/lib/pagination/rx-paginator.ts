import { BehaviorSubject, Observable } from 'rxjs';
import { Paginator, DataPaginator } from './data-paginator';

/**
 * Reactive Paginator service built-in pagination features
 * and observable updates of pagination state
 */
export class RxPaginator {
  private paginator: DataPaginator;
  private emitter: BehaviorSubject<Paginator>;

  /**
   * Stream that emits latest pagination settings...
   * NOTE: this does NOT cache most recent
   */
  pagination$: Observable<Paginator>;

  constructor(source: any[] = [], pageSize = 10) {
    this.paginator = new DataPaginator(source, pageSize);
    this.emitter = new BehaviorSubject<Paginator>({} as Paginator);
    this.pagination$ = this.emitter.asObservable();

    this.announceChanges();
  }

  goToPage(page: number): any[] {
    const results = this.paginator.goToPage(page);
    this.announceChanges();
    return results;
  }

  setPageSize(numRowsPerPage: number) {
    this.paginator.pageSize = numRowsPerPage;
    this.announceChanges();
  }

  set dataSource(source: any[]) {
    const current = this.toSnapshot();

    this.paginator.rawList = source;
    this.paginator.goToPage(current.currentPage);

    const next = this.toSnapshot();

    const isSame = sameCount(current, next) && sameFirstItem(current, next);
    if (!isSame) {
      // Reset to show the first page
      this.paginator.goToPage(1);
    }

    this.announceChanges();
  }

  /**
   * Emit a snapshot view model of the current DataPaginator
   * state...
   */
  private announceChanges() {
    const api = this.toSnapshot();
    this.emitter.next(api);
  }

  public toSnapshot(): Paginator {
    const { totalCount, totalPages, currentPage, paginatedList, pageSize } = this.paginator;

    return {
      totalCount,
      totalPages,
      currentPage,
      paginatedList,
      pageSize,
      goToPage: this.goToPage.bind(this),
      setPageSize: this.setPageSize.bind(this),
    };
  }
}

function sameFirstItem(a: Paginator, b: Paginator): any {
  const sameNumItems = a.paginatedList.length === b.paginatedList.length;
  const firstID = (target: Paginator) => (target.paginatedList.length ? target.paginatedList[0].id : null);
  return sameNumItems && firstID(a) === firstID(b);
}

function sameCount(a: Paginator, b: Paginator) {
  return a.totalCount === b.totalCount && a.totalPages === b.totalPages;
}
