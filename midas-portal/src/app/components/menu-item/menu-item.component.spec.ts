import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MenuItemComponent } from './menu-item.component';
import { MenuItem } from '../custom-sidenav/custom-sidenav.component';
import { ConfigurationService } from 'oarng';
import { CredentialsService } from '../../services/credentials.service';
import { DashboardService } from '../../services/dashboard.service';
import { DataService } from '../../services/data.service';

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      declarations: [MenuItemComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            getConfig: jasmine.createSpy('getConfig').and.returnValue({})
          }
        },
        {
          provide: CredentialsService,
          useValue: {
            token: signal('mock-token'),
            userId: signal('testUser')
          }
        },
        {
          provide: DashboardService,
          useValue: {}
        },
        {
          provide: DataService,
          useValue: {}
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MenuItemComponent);
    component = fixture.componentInstance;
    
    // Set the required item input with correct MenuItem properties
    const mockMenuItem: MenuItem = {
      key: 'test',
      name: 'Test Menu Item',
      icon: 'test-icon',
      link: '/test',
      subItems: []
    };
    
    fixture.componentRef.setInput('item', mockMenuItem);
    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with nestedMenuOpened as false', () => {
    expect(component.nestedMenuOpened()).toBe(false);
  });

  it('should set active item', () => {
    const testItem: MenuItem = {
      key: 'active',
      name: 'Active Item',
      icon: 'active-icon',
      link: '/active'
    };
    
    component.setActive(testItem);
    expect(component.activeItem).toBe(testItem);
  });

  it('should identify internal routes correctly', () => {
    const internalItem: MenuItem = {
      key: 'internal',
      name: 'Internal',
      icon: 'internal-icon',
      link: '/internal'
    };
    
    const externalItem: MenuItem = {
      key: 'external',
      name: 'External',
      icon: 'external-icon',
      link: 'https://external.com'
    };
    
    expect(component.isInternalRoute(internalItem)).toBe(true);
    expect(component.isInternalRoute(externalItem)).toBe(false);
  });

  it('should toggle nested menu when item has subItems', () => {
    const itemWithSubItems: MenuItem = {
      key: 'parent',
      name: 'Parent Item',
      icon: 'parent-icon',
      link: '/parent',
      subItems: [
        { key: 'child', name: 'Child', icon: 'child-icon', link: '/child' }
      ]
    };
    
    fixture.componentRef.setInput('item', itemWithSubItems);
    fixture.detectChanges();
    
    component.toggleNestedMenu();
    expect(component.nestedMenuOpened()).toBe(true);
    
    component.toggleNestedMenu();
    expect(component.nestedMenuOpened()).toBe(false);
  });
});
