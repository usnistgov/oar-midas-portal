import { Component, OnInit, } from '@angular/core';
import {
  faHouse, faUser, faDashboard, faCloud, faClipboardList,
  faSearch, faFileCirclePlus, faPlus, faBook, faListCheck, faLink, faAddressBook
  , faCircle, faPrint, faPersonCircleQuestion, faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { DialogService, } from 'primeng/dynamicdialog';
import { AuthenticationService } from 'oarng';


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
  faCircle = faCircle;
  faBuilding = faBuilding;
  faPlus = faPlus;
  faHouse = faHouse;
  faUser = faUser;
  faDashboard = faDashboard;
  faCloud = faCloud;
  faClipboardList = faClipboardList;
  faSearch = faSearch;
  faFileCirclePlus = faFileCirclePlus;
  faBook = faBook;
  faListCheck = faListCheck;
  faPrint = faPrint;
  faPersonCircleQuestion = faPersonCircleQuestion;
  userLastName: string | undefined;
  userName: string | undefined;
  userEmail: string | undefined;
  userId: string | undefined;
  userOU: string | undefined;
  userDiv: string | undefined;
  authToken: string | null = null;


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
    )
  }
}

