import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigurationService } from 'oarng';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;
  private subject: Subject<string>;

  constructor(private configSvc: ConfigurationService) {
    this.subject = new Subject<string>();
  }

  public connect(authToken:string): void {
    console.log("test")
    const websocketUrl = this.configSvc.getConfig()['websocket_dbio'];
    const websocketUrlWithToken = `${websocketUrl}?token=${encodeURIComponent(authToken)}`;
    this.socket = new WebSocket(websocketUrlWithToken);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };


    this.socket.onmessage = (event) => {
      this.subject.next(event.data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  public getRecord(string: string): string {
    const parts = string.split(','); 
    return parts[1];
  }

  public toHumanReadable(string: string): { severity: string; summary: string; detail: string } {
    const parts = string.split(','); // Split the string by commas
    const action = parts[0]; 
    const projectId = parts[1]; 
    const dmpId = parts[2]; 

    switch (action) {
      case 'proj-create':
        return {
          severity: 'success',
          summary: 'New Record Created',
          detail: `A new ${projectId} has been created (${dmpId})`,
        };
      case 'proj-update':
        return {
          severity: 'info',
          summary: 'Record Updated',
          detail: `The ${projectId} ${dmpId} has been updated`,
        };
      default:
        return {
          severity: 'warn',
          summary: 'Unknown Action',
          detail: 'An unknown action was received',
        };
    }
  }
  
   get messages(): Observable<string> {
    return this.subject.asObservable();
  }
}