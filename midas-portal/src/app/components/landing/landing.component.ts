import { Component, OnInit, OnChanges, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { CustomizationService } from '../auth-service/auth.service';
import { AuthService, WebAuthService } from '../auth-service/auth.service';
import {MenuModule} from 'primeng/menu';
import {MenuItem} from 'primeng/api';
import { faHouse, faUser, faDashboard, faCloud, faClipboardList, faSearch, faFileCirclePlus, faPlus, faDatabase,faBook, faListCheck , faPrint, faPersonCircleQuestion} from '@fortawesome/free-solid-svg-icons';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: [
    './landing.component.css'

  ]
})
export class LandingComponent implements OnInit {

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
  faPersonCircleQuestion=faPersonCircleQuestion;
  private _custsvc: CustomizationService ;
  public username: string;
  events: string[] = [];
  opened: boolean;
  items: MenuItem[];
  // public constructor(private authsvc: AuthService) { 
    
  // }

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.startEditing(true);

    this.items = [{
      label: 'File',
      items: [
          {label: 'New', icon: 'pi pi-fw pi-plus'},
          {label: 'Download', icon: 'pi pi-fw pi-download'}
      ]
  },
  {
      label: 'Edit',
      items: [
          {label: 'Add User', icon: 'pi pi-fw pi-user-plus'},
          {label: 'Remove User', icon: 'pi pi-fw pi-user-minus'}
      ]
  }];
    
  }


  public logintest(){
    alert("Test");
    // this.authsvc.getUserInfo();
  }
    /**
     * return true if the user is currently authorized to to edit the resource metadata.
     * If false, can attempt to gain authorization via a call to authorizeEditing();
     */
     public isAuthorized(): boolean {
      return Boolean(this._custsvc);
  }


  public startEditing(nologin: boolean = false): void {
alert("Test editing")
    this.http.get("https://p932439.nist.gov/sso/auth/_logininfo/").subscribe( (data) => {alert ("Test")} )
  //   this.authorizeEditing(nologin).subscribe(
  //     (successful) => {
  //       // User authorized
  //       if(successful){
  //         console.log("Loading draft...");

  //       }
  //     },
  //     (err) => {
  //         console.log("Authentication failed.");
  //     }
  // );
  }

  /**
     * obtain authorization to edit the metadata and pass that authorization to the editing widgets.
     *
     * Authorization in this context mean a CustomizationService with a valid authorization token 
     * embedded in it.  The CustomizationService will be passed to the MetadataUpdateService so 
     * that it can send updates from the editing widgets to the remote customization web service.  
     *
     * Note that calling this method may cause the browser to redirect to an authorization server, 
     * and, thus, this function would not return to its caller.  The authorization server should 
     * return the browser to the landing page which should trigger calling this function again.  
     * 
     * @param nologin   if false (default) and the user is not logged in, the browser will be redirected 
     *                  to the authentication service.  If true, redirection will not occur; instead, 
     *                  false is returned if the user is not logged in.  
     * @return Observable<boolean>   this will resolve to true if the application is authorized; 
     *                               false, if either the user could not authenticate or is otherwise 
     *                               not allowed to edit this record.  
     */
//    public authorizeEditing(nologin: boolean = false): Observable<boolean> {
//     if (this._custsvc) return of<boolean>(true);   // We're already authorized


//     return new Observable<boolean>(subscriber => {
//         console.log("obtaining editing authorization");
//         // this.statusbar.showMessage("Authenticating/authorizing access...", true)

//         this.authsvc.authorizeEditing(nologin).subscribe(  // might cause redirect (see above)
//             (custsvc) => {
//                 this._custsvc = custsvc;    // could be null, indicating user is not authorized.
//                 // this.mdupdsvc._setCustomizationService(custsvc);
//                 this.username = this._custsvc.userId; 
//                 console.log("USER NAME"+this.username );
//                 var msg: string = "";
//                 var authenticated: boolean = false;

//                 if (!this.authsvc.userID) {
//                     msg = "authentication failed";
//                     console.log("User log in cancelled or failed.")
//                 }
//                 else if (!custsvc) {
//                     msg = "authorization denied for user " + this.authsvc.userID;
//                     if(this.authsvc.errorMessage)
//                     console.log(this.authsvc.errorMessage);
//                     else
//                        console.log("Sorry, you are not authorized to edit this submission.")    // Default message
//                       //  this.msgsvc.error("Sorry, you are not authorized to edit this submission.")
//                 }
//                 else{
//                     msg = "authorization granted for user " + this.authsvc.userID;
//                     authenticated = true;
//                 }

//                 console.log(msg);
//                 // this.statusbar.showMessage(msg, false); 

//                 if(authenticated){
//                   subscriber.next(Boolean(this._custsvc));
//                   // this.edstatsvc._setUserID(this.authsvc.userID);
//                   // this.edstatsvc._setAuthorized(true);
//                 }else{
//                   subscriber.next(false);
//                   // this.edstatsvc._setAuthorized(false);
//                   // this.edstatsvc._setEditMode(this.EDIT_MODES.PREVIEW_MODE)
//                 }
                
//                 subscriber.complete();
//             },
//             (err) => {
//                 let msg = "Failure during authorization: " + err.message;
//                 // this.statusbar.showMessage(msg, false); 
//                 console.error(msg);
//                 // this.msgsvc.syserror(msg);
//                 subscriber.next(false);
//                 subscriber.complete();
//                 // this.edstatsvc._setAuthorized(false);
//                 // this.edstatsvc._setEditMode(this.EDIT_MODES.PREVIEW_MODE)
//             }
//         );
//     });
// }
}

