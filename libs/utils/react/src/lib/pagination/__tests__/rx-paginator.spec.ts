import { spyOn } from '../../rxjs/testing';

import { Paginator } from '../data-paginator';
import { RxPaginator } from '../rx-paginator';

const PAGE_SIZE = 3;
describe('Rx-Paginator', () => {
  let pager: RxPaginator;
  beforeEach(() => {
    pager = new RxPaginator([1, 3, 5, 7, 9], PAGE_SIZE);
  });

  it('should emit pagination information', (done) => {
    const subscription = pager.pagination$.subscribe((snapshot) => {
      expect(snapshot.totalCount).toBe(5);
      expect(snapshot.totalPages).toBe(2);
      expect(snapshot.pageSize).toBe(PAGE_SIZE);
      expect(snapshot.paginatedList.length).toBe(PAGE_SIZE);
    });

    subscription.unsubscribe();
    done();
  });
  it('should emit pagination information', () => {
    const { spy, dispose } = spyOn(pager.pagination$);
    expect(spy.state.called.next).toBe(true);

    // most recent value emitted
    const snapshot = spy.values.pop() as Paginator;

    expect(snapshot.totalCount).toBe(5);
    expect(snapshot.totalPages).toBe(2);
    expect(snapshot.pageSize).toBe(PAGE_SIZE);
    expect(snapshot.paginatedList.length).toBe(PAGE_SIZE);

    dispose();
  });

  it('should emit most-recent pagination information', () => {
    pager.dataSource = ['Thomas', 'Harry', 'Talon'];

    const { spy, dispose } = spyOn(pager.pagination$);
    expect(spy.state.called.next).toBe(true);

    // most recent value emitted
    const snapshot = spy.values.pop() as Paginator;

    expect(snapshot.totalCount).toBe(3);
    expect(snapshot.totalPages).toBe(1);
    expect(snapshot.pageSize).toBe(PAGE_SIZE);
    expect(snapshot.paginatedList.length).toBe(3);
    expect(snapshot.paginatedList[0]).toBe('Thomas');

    dispose();
  });

  it('should emit changes when the datasource changes', () => {
    const dataSource = [1, 2, 3, 4, 5, 6, 7, 8, 9, 20];
    const { spy, dispose } = spyOn(pager.pagination$);
    expect(spy.state.called.next).toBe(true);

    pager.dataSource = dataSource;

    // most recent value emitted
    const snapshot = spy.values.pop() as Paginator;

    expect(snapshot.totalCount).toBe(dataSource.length);
    expect(snapshot.totalPages).toBe(Math.ceil(dataSource.length / PAGE_SIZE));
    expect(snapshot.pageSize).toBe(PAGE_SIZE);
    expect(snapshot.paginatedList.length).toBe(PAGE_SIZE);

    dispose();
  });

  it('should emit changes when the pageSize changes', () => {
    const dataSource = [1, 2, 3, 4, 5, 6, 7, 8, 9, 20];
    const { spy, dispose } = spyOn(pager.pagination$);
    expect(spy.state.called.next).toBe(true);

    pager.dataSource = dataSource;

    // most recent value emitted
    const snap1 = spy.values.pop() as Paginator;

    expect(snap1.totalPages).toBe(Math.ceil(dataSource.length / PAGE_SIZE));
    expect(snap1.pageSize).toBe(PAGE_SIZE);
    expect(snap1.paginatedList.length).toBe(PAGE_SIZE);

    pager.setPageSize(2);

    // most recent value emitted
    const snap2 = spy.values.pop() as Paginator;

    expect(snap2.totalPages).toBe(Math.ceil(dataSource.length / 2));
    expect(snap2.pageSize).toBe(2);
    expect(snap2.paginatedList.length).toBe(2);

    dispose();
  });
});
