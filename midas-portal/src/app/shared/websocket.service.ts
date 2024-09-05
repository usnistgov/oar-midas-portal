import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigurationService } from 'oarng';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;
  //intermediary to emit WebSocket messages
  private subject: Subject<string>;

  constructor(private configSvc: ConfigurationService) {
    this.subject = new Subject<string>();
    //establishing the websocket connection with config from environment.json
    this.connect(this.configSvc.getConfig()['websocket_dbio']);
  }

  private connect(websocket_url :string): void {
    //create a new WebSocket connection with the server url provided 
    this.socket = new WebSocket(websocket_url);


    //listens for incoming messages from the ws
    this.socket.onmessage = (event) => {
        //when a message is received, the message is emitted to the subscribers
      this.subject.next(event.data);
    };

    this.socket.onclose = () => {
        //when the connection is closed, a message is logged to the console
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
        //when there's an error, a message is logged to the console
      console.error('WebSocket error:', error);
    };
  }
    //returns the subject as an observable allowing other components of the app to subscribe to it
   get messages(): Observable<string> {
    return this.subject.asObservable();
  }
}