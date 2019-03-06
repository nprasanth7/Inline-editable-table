import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollableDataTableComponent } from './scrollable-data-table.component';

describe('ScrollableDataTableComponent', () => {
  let component: ScrollableDataTableComponent;
  let fixture: ComponentFixture<ScrollableDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrollableDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollableDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
