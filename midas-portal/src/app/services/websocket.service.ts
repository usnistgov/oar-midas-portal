import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();

  connect(url: string) {
  if (this.socket) return; // <--- If socket is already set, it will never reconnect!
  this.socket = new WebSocket(url);

  this.socket.onopen = () => {
  };

  this.socket.onmessage = (event) => {
    this.messageSubject.next(event.data);
  };

  this.socket.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  this.socket.onclose = () => {
    this.socket = null;
  };
}

 toDisplay(msg: string): string {
    const parts = msg.split(',');
    switch (parts[0]) {
        case 'proj-create':
        return `A new ${parts[1]} record has been created: ${parts[2]}`;
        default:
        return msg; 
    }
 }

 record_type(msg:string): string{
    const parts = msg.split(',');
    return parts[1];
 }

  messages$(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}