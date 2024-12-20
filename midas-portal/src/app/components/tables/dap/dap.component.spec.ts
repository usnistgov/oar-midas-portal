import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DapComponent } from './dap.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SimpleChanges } from '@angular/core';
import { of } from 'rxjs';

describe('DapComponent', () => {
  let component: DapComponent;
  let fixture: ComponentFixture<DapComponent>;
  let dialogService: DialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DapComponent],
      imports: [HttpClientTestingModule],
      providers: [DialogService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DapComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should call fetchRecords if authToken is present', () => {
      const fetchRecordsSpy = jest.spyOn(component, 'fetchRecords');
      component.authToken = 'test-token';
      const changes: SimpleChanges = {
        authToken: {
          currentValue: 'test-token',
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      };
      component.ngOnChanges(changes);
      expect(fetchRecordsSpy).toHaveBeenCalledWith(component.dapAPI);
    });

    it('should log "No token" if authToken is not present', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      component.authToken = null;
      const changes: SimpleChanges = {
        authToken: {
          currentValue: null,
          previousValue: 'test-token',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      component.ngOnChanges(changes);
      expect(consoleSpy).toHaveBeenCalledWith('No token');
    });
  });

  describe('show', () => {
    it('should open the modal with DapModalComponent', () => {
      const openSpy = jest.spyOn(dialogService, 'open').mockReturnValue(new DynamicDialogRef());
      component.show();
      expect(openSpy).toHaveBeenCalledWith(DapComponent, {
        data: component.DAP,
        width: '90%'
      });
    });
  });
});