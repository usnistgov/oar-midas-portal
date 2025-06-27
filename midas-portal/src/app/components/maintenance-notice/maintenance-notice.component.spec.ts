import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceNoticeComponent } from './maintenance-notice.component';

describe('MaintenanceNoticeComponent', () => {
  let component: MaintenanceNoticeComponent;
  let fixture: ComponentFixture<MaintenanceNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaintenanceNoticeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaintenanceNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
