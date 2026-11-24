import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

// WebSocket.readyState values, named here so the checks below do not depend on the
// global constructor being present.
const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private url = '';
  private retryDelay = INITIAL_RETRY_MS;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private wakeListenersBound = false;

  connect(url: string) {
    this.url = url;
    this.bindWakeListeners();
    if (this.socket) return;
    this.open();
  }

  // A socket killed while the machine slept or the tab sat in the background often
  // reports nothing back to the page, so re-check it on the way back.
  private bindWakeListeners() {
    if (this.wakeListenersBound) return;
    this.wakeListenersBound = true;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.reconnectIfDead();
    });
    window.addEventListener('online', () => this.reconnectIfDead());
  }

  private reconnectIfDead() {
    const alive = !!this.socket &&
      (this.socket.readyState === SOCKET_CONNECTING || this.socket.readyState === SOCKET_OPEN);
    if (alive || !this.url) return;

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.socket = null;
    this.retryDelay = INITIAL_RETRY_MS;
    this.open();
  }

  private open() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.retryDelay = INITIAL_RETRY_MS;
    };

    this.socket.onmessage = (event) => {
      this.messageSubject.next(event.data);
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    // A proxy or the server can drop an idle socket.  Without reopening it the portal
    // keeps running but never hears about another record change.
    this.socket.onclose = () => {
      this.socket = null;
      this.scheduleRetry();
    };
  }

  private scheduleRetry() {
    if (this.retryTimer || !this.url) return;

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.open();
    }, this.retryDelay);

    this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_MS);
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