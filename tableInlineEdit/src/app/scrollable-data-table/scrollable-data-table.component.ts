import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ComponentFactoryResolver,
  ViewContainerRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectorRef,
  Renderer,
  ViewEncapsulation
} from '@angular/core';

import { EventManager } from '@angular/platform-browser';
import { MatPaginator, MatSort, MatSortable } from '@angular/material';
import { Subscription, Observable, Subject } from 'rxjs';

@Component({
  selector: 'scrollable-data-table',
  templateUrl: './scrollable-data-table.component.html',
  styleUrls: ['./scrollable-data-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScrollableDataTableComponent implements OnInit, AfterViewInit {
  setTimeout: any;
  table: Observable<Array<any>>;
  sum = 10;
  pageLimit = 20;
  pageOffset = 1;
  deleteData: Observable<Array<any>>;
  start: any = undefined;
  pressed: Boolean = false;
  startX: any;
  startWidth: any;
  resizableFnMousemove: Function;
  resizableFnMouseup: Function;
  sortedColumnConfigRef;
  sortObject: any = {};
  disableSelectAll = false;
  isSelectWithDropDown: any;
  /**
   * Declare global variable
   */

  public tableConfig: any;

  /**
   * Create a new class for table using matTable
   */
  dataSource: any;

  /**
   * declare empty array expand table data
   */
  expandedElement: any;
  /**
   * declare pagination event's
   */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /**
   * initialize ng6TableConfig the Input and Output Event's
   */
  /**
   * create a child event for mat table sorting
   */
  @ViewChild(MatSort) sort: MatSort;
  @Input() ng6TableConfig: any;
  @Input() ng6TableData: any;
  @Output() ng6TableEvents = new EventEmitter();
  @ViewChildren('dynamic', { read: ViewContainerRef })
  @ViewChild('multiSelect')
  checkbox;
  @ViewChild('scroll') content: any;
  //checkbox
  public widgetTargets: QueryList<ViewContainerRef>;
  private resizeSubject: Subject<Window>;
  /**
   *Initalize all table config or set default value
   */
  private resizeSubscription: Subscription;

  constructor(
    private eventManager: EventManager,
    private componentFactoryResolver: ComponentFactoryResolver,
    public viewContainerRef: ViewContainerRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer
  ) {
    this.resizeSubject = new Subject();
    this.eventManager.addGlobalEventListener(
      'window',
      'resize',
      this.onResize.bind(this)
    );
  }

  /**
   * @description single checkbox click
   * @param {*} datum
   * @memberof ScrollableDataTableComponent
   */
  onCheckboxChange(datum?) {
    this.checkIsSelected(datum);
    this.matTableCofig();
    this.applyChanges();
    this.setState();
  }

  onCheckboxWithDropDownClick(event, datum) {
    if (this.ng6TableConfig.selectWithDropDown) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  onCheckboxClick(event, datum) {
    if (this.ng6TableConfig.selectConfig && this.ng6TableConfig.selectConfig.key) {
      if (this.ng6TableConfig.selectConfig.values.indexOf(datum[this.ng6TableConfig.selectConfig.key]) === -1) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  }

  unselectAll() {
    for (let i = 0; i < this.ng6TableData.length; i++) {
      this.ng6TableData[i].isSelected = false;
    }
    this.tableConfig.topLevel = false;
    if (this.checkbox) {
      this.checkbox.indeterminate = false;
    }
    this.emitCheckboxEvent();
  }

  /**
   * @description handle top level multiselect event's -- select all
   * @memberof ScrollableDataTableComponent
   */
  topLevelChange(config?) {
    if (this.tableConfig.selectWithDropDown) {
      this.isSelectWithDropDown = config || this.isSelectWithDropDown;
      this.tableConfig.topLevel = this.isSelectWithDropDown.value !== "None";
      this.checkbox.indeterminate = false;
      for (let i = 0; i < this.ng6TableData.length; i++) {
        const value = (this.isSelectWithDropDown.value === "All" || this.ng6TableData[i][this.tableConfig.selectDropDownKeyConfig.key] === this.isSelectWithDropDown.value) ? true : false;
        this.ng6TableData[i].isSelected = value;
      }
      this.emitCheckboxEvent();
      return;
    }
    if (this.ng6TableConfig.selectConfig && this.ng6TableConfig.selectConfig.key) {
      for (let i = 0; i < this.ng6TableData.length; i++) {
        if (this.ng6TableConfig.selectConfig.values.indexOf(this.ng6TableData[i][this.ng6TableConfig.selectConfig.key]) !== -1) {
          this.ng6TableData[i].isSelected = this.tableConfig.topLevel;
        }
      }
    }
    this.emitCheckboxEvent();
  }

  checkIsSelected(datum?) {
    let count = 0, i = 0;
    if (this.tableConfig.selectWithDropDown) {
      this.tableConfig.selectDropDownConfig.forEach((selectConfig, ind) => {
        if (selectConfig.value === datum[this.tableConfig.selectDropDownKeyConfig.key]) {
          this.isSelectWithDropDown = selectConfig
        }
      });
      this.ng6TableData.forEach((val, ind) => {
        if (val[this.tableConfig.selectDropDownKeyConfig.key] === datum[this.tableConfig.selectDropDownKeyConfig.key]) {
          i++;
          if (val.isSelected) {
            count++;
          }
        }
      });
    }
    if (this.ng6TableConfig.select && this.ng6TableConfig.selectConfig && this.ng6TableConfig.selectConfig.key) {
      for (let j = 0; j < this.ng6TableData.length; j++) {
        if (this.ng6TableConfig.selectConfig.values.indexOf(this.ng6TableData[j][this.ng6TableConfig.selectConfig.key]) !== -1) {
          i++;
          if (this.ng6TableData[j].isSelected) {
            count++;
          }
        }
      }
    }
    this.tableConfig.topLevel = count === 0 ? false : true;
    if (this.checkbox) {
      this.checkbox.indeterminate = count > 0 && count < i;
    }
    this.emitCheckboxEvent();
  }

  emitCheckboxEvent(config?) {
    const indeterminateData = {
      event: 'indeterminate',
      isSelected: this.tableConfig.topLevel,
      isConfiguredAll: this.tableConfig.topLevel && !this.checkbox.indeterminate,
      selectDropDownConfig: this.isSelectWithDropDown || null
    };
    this.ng6TableEvents.emit(indeterminateData);
  }

  get onResize$(): Observable<Window> {
    return this.resizeSubject.asObservable();
  }

  ngOnInit() {
    /**
     * initialize the config setting based parent data or set default values
     */
    this.tableConfig = {
      editable: this.ng6TableConfig.editable || false, // not used
      filter: this.ng6TableConfig.filter || false, // not used
      select: this.ng6TableConfig.select || false,
      selectWithDropDown: this.ng6TableConfig.selectWithDropDown || false,
      selectConfig: this.ng6TableConfig.selectConfig || {},
      pagination: this.ng6TableConfig.pagination || false, // not used
      expandable: this.ng6TableConfig.expandable || false,
      lazyLoading: this.ng6TableConfig.lazyLoading || false,
      sorting: this.ng6TableConfig.sorting || false,
      buttonPlacement: this.ng6TableConfig.buttonPlacement || false,
      columnConfig: this.ng6TableConfig.columnConfig || [],
      selectDropDownConfig: this.ng6TableConfig.selectDropDownConfig || [],
      selectDropDownKeyConfig: this.ng6TableConfig.selectDropDownKeyConfig || {},
      buttonConfig: this.ng6TableConfig.buttons || [],
      language: this.ng6TableConfig.languageSetting || {},
      serialNumber: this.ng6TableConfig.serialNumber || false,
      tooltip: this.ng6TableConfig.tooltip || false,
      pageLength: 100,
      pageSize: 10,
      notFound: this.ng6TableConfig.notFound || false,
      selectedVal: '',
      multiSelectVal: '',
      topLevel: false,
      pageSizeOptions: [5, 10, 25, 100],
      searchString: '',
      sortedColumnConfig: [],
      columnsHeaderName: [],
      ng6CheckboxData: [],
      enableExpand: false,
      spinnerConfig: this.ng6TableConfig.spinnerConfig
        ? this.ng6TableConfig.spinnerConfig
        : {}
    };

    /**
     *Push Action column if user set ediatbel is true
     */
    if (this.tableConfig.editable && this.tableConfig.buttonPlacement === 'row') {
      this.tableConfig.columnConfig.push({
        label: 'Action',
        colData: 'action',
        priority: this.tableConfig.columnConfig + 1,
        width: 50
      });
    }

    /**
     *Push Select column if user set select is true
     */
    if (this.tableConfig.select) {
      this.tableConfig.columnConfig.unshift({
        label: 'Select',
        colData: 'select',
        filter: false,
        priority: '',
        style: {
          width: '50px'
        }
      });
    }
    if (this.tableConfig.selectWithDropDown) {
      this.tableConfig.columnConfig.unshift({
        label: 'SelectWithDropDown',
        colData: 'selectWithDropDown',
        filter: false,
        priority: '',
        style: {
          width: '50px'
        }
      });
    }
    /**
     *Push Expand column if user set expandable is true
     */
    if (this.tableConfig.expandable) {
      this.tableConfig.columnConfig.unshift({
        label: 'Expand',
        colData: 'expand',
        filter: false,
        priority: '',
        style: {
          width: '50px'
        }
      });
    }
    if (this.tableConfig.serialNumber) {
      this.tableConfig.columnConfig.unshift({
        label: 'No',
        colData: 'position',
        sortDisable: false,
        priority: '1',
        style: {
          width: '100px'
        }
      });
      for (let i = 0; i < this.ng6TableData.length; i++) {
        this.ng6TableData[i].position = i + 1;
      }
    }

    this.tableConfig.ng6CheckboxData = this.ng6TableData;
    this.expandedElement = this.ng6TableData;
    this.tableConfig.sortedColumnConfig = this.sortArray(
      this.tableConfig.columnConfig,
      'priority'
    );
    this.tableConfig.columnsHeaderName = this.tableConfig.sortedColumnConfig.map(
      c => {
        c.className = c.label.replace(" ", "-");
        return c.colData;
      }
    );
    this.sortedColumnConfigRef = this.tableConfig.sortedColumnConfig;
    this.matTableCofig();

    /**
     * Subcribe the windows resize event listener
     */
    this.resizeSubscription = this.onResize$.subscribe(size => {
      if (size.innerWidth > 425 && size.innerWidth <= 768) {
        this.tableConfig.enableExpand = true;
        this.reOrderHaaderBasedPriority(3);
      } else if (size.innerWidth <= 425) {
        this.tableConfig.enableExpand = true;
        this.reOrderHaaderBasedPriority(2);
      } else {
        this.tableConfig.enableExpand = false;
        this.reOrderHaaderBasedPriority(false);
      }
    });
    if (window.innerWidth > 425 && window.innerWidth <= 768) {
      this.tableConfig.enableExpand = true;
      this.reOrderHaaderBasedPriority(3);
    } else if (window.innerWidth <= 425) {
      this.tableConfig.enableExpand = true;
      this.reOrderHaaderBasedPriority(2);
    } else {
      this.tableConfig.enableExpand = false;
      this.reOrderHaaderBasedPriority(false);
    }
  }

  reOrderHaaderBasedPriority(count) {
    console.log('count', count);
    if (!count && this.sortedColumnConfigRef) {
      this.tableConfig.columnConfig = this.sortedColumnConfigRef;
    } else {
      const tempArray = [];
      for (let i = 0; i < count; i++) {
        tempArray.push(this.sortedColumnConfigRef[i]);
      }
      this.tableConfig.columnConfig = tempArray;
    }
    this.tableConfig.sortedColumnConfig = this.sortArray(
      this.tableConfig.columnConfig,
      'priority'
    );
    this.tableConfig.columnsHeaderName = this.tableConfig.sortedColumnConfig.map(
      c => c.colData
    );
    this.matTableCofig();
  }

  onResize(event: UIEvent) {
    this.resizeSubject.next(<Window>event.target);
  }

  OnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
  /**
   * toogle a table row on click expand arrows
   */
  expandableRow(value: Element) {
    console.log('value', value);
    // tslint:disable-next-line:no-string-literal
    value['detailRow'] = !value['detailRow'];
    // this.dataSource.data.find(elem => {
    //   if (elem['asset'] !== undefined && elem['asset'] === value['asset']) {
    const index = this.dataSource.data.indexOf(value);
    this.dataSource.data[index].show = !this.dataSource.data[index].show;
    return false;
    //   }
    // });
  }
  /**
   * Assign data into mat table datasource
   */
  matTableCofig() {
    this.dataSource = this.ng6TableData;
    if (this.tableConfig && this.ng6TableData) {
      this.tableConfig.pageLength = this.ng6TableData.length;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    // this.dataSource.sort = this.sort;
  }
  /**
   * apply global filter logic's
   */
  applyFilter(filterValue: string, column) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filterData = filterValue;
  }

  /**
   *handle button events based on config
   */
  actionButtonEvents(event, data, button) {
    console.log('event', event, 'data', data);
    if (button.label === 'Edit') {
      data.editing = !data.editing;
    }
    if (button.label === 'Save') {
      data.editing = false;
    }
    if (button.label === 'Cancel') {
      data.editing = false;
    }
    if (button.label === 'Delete') {
      this.tableConfig.spinnerConfig.spinner = true;
      const index: number = this.ng6TableData.indexOf(data);
      if (index !== -1) {
        this.ng6TableData.splice(index, 1);
        this.matTableCofig();
        const self = this;
        setTimeout(() => {
          self.tableConfig.spinnerConfig.spinner = false;
        }, 500);
      }
    }
  }
  sortArray(array: any[], field: string) {
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

  /**
   * Listern the events afetr template change
   */
  ngAfterViewInit() {
    this.applyChanges();
    this.setState();
    this._changeDetectorRef.detectChanges();
  }

  applyChanges() {
    if (this.ng6TableData) {
      this.ng6TableData = this.ng6TableData;
    }
  }

  setState() {
    if (!this.ng6TableData || !this.ng6TableData.length) {
      return;
    }
  }

  sortData(event) {
    this.sortObject = {
      event: 'sort',
      data: event
    };
    this.pageOffset = 1;
    this.ng6TableEvents.emit(this.sortObject);
    console.log('invoking Sort');
  }

  onScroll() {
    try {
      this.matTableCofig();
      this.applyChanges();

      const element = this.content.element.nativeElement;
      if ((element.scrollTop + element.offsetHeight) >= (element.scrollHeight - 10)) {
        const scrollData = {
          event: 'scroll',
          data: {
            limit: this.pageLimit,
            offset: ++this.pageOffset,
            active: this.sortObject.data ? this.sortObject.data.active : null,
            direction: this.sortObject.data
              ? this.sortObject.data.direction
              : null
          }
        };
        this.ng6TableEvents.emit(scrollData);
        console.log('invoking scroll');
      }
      // check items on scroll when select all is checked
      if (this.checkbox && !this.checkbox.indeterminate) {
        this.topLevelChange();
      } else {
        this.emitCheckboxEvent();
      }


    } catch (err) {
      console.log('error:', err);
    }
  }
}
