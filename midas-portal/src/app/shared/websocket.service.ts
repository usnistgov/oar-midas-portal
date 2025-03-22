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
    const websocketUrl = this.configSvc.getConfig()['websocket_dbio'];
    const websocketUrlWithToken = `${websocketUrl}?token=${encodeURIComponent(authToken)}`;
    this.socket = new WebSocket(websocketUrlWithToken);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };


    this.socket.onmessage = (event) => {
      this.subject.next(event.data);
      console.log('WebSocket message received:', event.data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
   get messages(): Observable<string> {
    return this.subject.asObservable();
  }
}