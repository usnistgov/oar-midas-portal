import { Component, OnInit, } from '@angular/core';
import {
  faHouse, faUser, faDashboard, faCloud, faClipboardList,
  faSearch, faFileCirclePlus, faPlus, faBook, faListCheck, faLink, faAddressBook, faMicrochip, faMagnifyingGlass
  , faCircle, faPrint, faPersonCircleQuestion, faBuilding, faSquareCaretDown,faSquareCaretUp, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { AuthenticationService } from 'oarng';
import { SearchListModalComponent } from '../modals/search/search-list.component';
import { InfoComponent } from '../modals/info/info.component';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  providers: [DialogService, MessageService],
  styleUrls: [
    './landing.component.css'
  ]
})
export class LandingComponent implements OnInit {
  faAddressBook = faAddressBook;
  faLink = faLink;
  faSquareCaretUp =faSquareCaretUp;
  faSquareCaretDown = faSquareCaretDown;
  faCircle = faCircle;
  faBuilding = faBuilding;
  faPlus = faPlus;
  faHouse = faHouse;
  faUser = faUser;
  faDashboard =faDashboard;
  faCloud =faCloud;
  faClipboardList= faClipboardList;
  faSearch=faSearch;
  faFileCirclePlus=faFileCirclePlus;
  faBook=faBook;
  faListCheck=faListCheck;
  faPrint=faPrint;
  faMicrochip=faMicrochip;
  faMagnifyingGlass=faMagnifyingGlass;
  faPersonCircleQuestion=faPersonCircleQuestion;
  userLastName : string|undefined;
  userName: string|undefined;
  userEmail: string|undefined;
  userId: string|undefined;
  userOU: string|undefined;
  userDiv: string|undefined;
  authToken: string|null = null;
  ref: DynamicDialogRef;
  public searchResults: any[] = [];
  submenuCollapsed: boolean[] = [true, true];
  faInfoCircle = faInfoCircle;


  public constructor(private authsvc: AuthenticationService, public dialogService: DialogService,
    public messageService: MessageService) {

  }


  ngOnInit(): void {
    this.getUserInfo();
  }


  /**
   * This functions does two things :
   * 1- print a pop up to confirm to the user that he's connected
   * 2- inject some JS labels in the HTMl to make it 508 compliant
   */

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.userId)
      {}
      else{
        this.messageService.addAll([
          { severity: 'error', summary: 'Portal login failed', detail: 'Connected as anonymous' }
        ]);
    }}, 2000);

    // adding 508 labels to children of column
    let filter = document.getElementsByTagName("p-columnfilter");
    var Ar_filter = Array.prototype.slice.call(filter)
    for (let i of Ar_filter) {
      i.children[0].children[0].ariaLabel = "Last Modified"

    }

    // adding 508 labels to children of paginator
    let paginator = document.getElementsByTagName("p-paginator");
    var Ar_paginator = Array.prototype.slice.call(paginator)
    for (let i of Ar_paginator) {
      i.children[0].children[1].ariaLabel = "First page"
      i.children[0].children[2].ariaLabel = "Previous page"
      i.children[0].children[4].ariaLabel = "Next page"
      i.children[0].children[5].ariaLabel = "Last page"

    }
  }

  toggleInfo() {
    this.ref = this.dialogService.open(InfoComponent, {
      header: 'Complimentary information',
      width: '30%',
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 100001
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        console.log('Dialog closed with data:', data);
      }
    });
  }

  /**
   * This method is used to get the user info from the AuthenticationService.
   * it doesn't take any parameters because the service is used as a lib from oarng
   * @returns Observable<Credentials> custom model of Crendetials from auth including userID,username,useremail and userOU
   */

  public getUserInfo() {
    return this.authsvc.getCredentials().subscribe(
      creds => {
        if (!creds || !creds.userId)
          throw new Error("Missing identity information in credentials");
        console.log("Logged in as " + creds.userId);

        this.userId = creds.userId;
        this.userName = creds.userAttributes.userName;
        this.userLastName = creds.userAttributes.userLastName;
        this.userEmail = creds.userAttributes.userEmail;
        this.userOU = creds.userAttributes.userOU;
        if (creds.token)
          this.authToken = creds.token;
          //this.authToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJUZXN0SWQiLCJ1c2VyRW1haWwiOiJ0ZXN0dXNlckB0ZXN0LmNvbSIsImV4cCI6MTY5ODcxOTAxOSwidXNlck5hbWUiOiJUZXN0VXNlciIsInVzZXJMYXN0TmFtZSI6IlRlc3RMYXN0In0.ntiPIo39kG78T7xbVrbJEfw4cz8jn--Bk-t7aRJdvPs"
      },
      error => {
        alert("Unable to determine your identity");
      }
    )/*
    this.userId="TestId";
    this.userEmail= "test.user@nist.gov",
    this.userName= "Test",
    this.userLastName= "User",
    this.userOU= "MML",
    this.authToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJUZXN0SWQiLCJ1c2VyRW1haWwiOiJ0ZXN0dXNlckB0ZXN0LmNvbSIsImV4cCI6MTY5ODcxOTAxOSwidXNlck5hbWUiOiJUZXN0VXNlciIsInVzZXJMYXN0TmFtZSI6IlRlc3RMYXN0In0.ntiPIo39kG78T7xbVrbJEfw4cz8jn--Bk-t7aRJdvPs"
*/
  }

 
  toggleSubmenu(index: number): void {
    this.submenuCollapsed[index] = !this.submenuCollapsed[index]; // Toggle the state of the selected submenu
  }

  onSearchKeyUp(value: string) {

    this.ref = this.dialogService.open(SearchListModalComponent, {
      data: {value: value,authToken:this.authToken},
      width: '80%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });
  }
}
