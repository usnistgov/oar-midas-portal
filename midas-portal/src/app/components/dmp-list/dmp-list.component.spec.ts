import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmpListComponent } from './dmp-list.component';

describe('DmpListComponent', () => {
  let component: DmpListComponent;
  let fixture: ComponentFixture<DmpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DmpListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DmpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
