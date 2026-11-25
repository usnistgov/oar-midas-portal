import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  onopen?: () => void;
  onmessage?: (e: { data: string }) => void;
  onerror?: (e: unknown) => void;
  onclose?: () => void;
  readyState = 1;   // OPEN

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  // a clean close: the page is told about it
  drop() {
    this.readyState = 3;
    this.onclose?.();
  }

  // the machine slept: the socket is dead but nothing fired
  dieSilently() {
    this.readyState = 3;
  }
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WebSocketService] });
    service = TestBed.inject(WebSocketService);
    FakeWebSocket.instances = [];
    (globalThis as any).WebSocket = FakeWebSocket;
  });

  it('describes a record creation', () => {
    expect(service.toDisplay('proj-create,dmp,My Plan'))
      .toBe('A new dmp record has been created: My Plan');
  });

  it('passes an unrecognized message through unchanged', () => {
    expect(service.toDisplay('something-else,dmp,x')).toBe('something-else,dmp,x');
  });

  it('reports the record type', () => {
    expect(service.record_type('proj-create,dap,My Dataset')).toBe('dap');
  });

  describe('connection handling', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('opens a single socket for repeated connect calls', () => {
      service.connect('wss://localhost/midas-ws');
      service.connect('wss://localhost/midas-ws');

      expect(FakeWebSocket.instances.length).toBe(1);
      expect(FakeWebSocket.instances[0].url).toBe('wss://localhost/midas-ws');
    });

    it('reopens the socket after the server drops it', () => {
      service.connect('wss://localhost/midas-ws');
      FakeWebSocket.instances[0].drop();

      jest.advanceTimersByTime(1000);

      expect(FakeWebSocket.instances.length).toBe(2);
    });

    it('still delivers messages after a reconnect', () => {
      const seen: string[] = [];
      service.messages$().subscribe(m => seen.push(m));

      service.connect('wss://localhost/midas-ws');
      FakeWebSocket.instances[0].drop();
      jest.advanceTimersByTime(1000);

      FakeWebSocket.instances[1].onmessage?.({ data: 'proj-create,dmp,After Reconnect' });

      expect(seen).toEqual(['proj-create,dmp,After Reconnect']);
    });

    it('backs off between successive failed reconnects', () => {
      service.connect('wss://localhost/midas-ws');

      FakeWebSocket.instances[0].drop();
      jest.advanceTimersByTime(1000);
      expect(FakeWebSocket.instances.length).toBe(2);

      // second drop waits longer than the first
      FakeWebSocket.instances[1].drop();
      jest.advanceTimersByTime(1000);
      expect(FakeWebSocket.instances.length).toBe(2);

      jest.advanceTimersByTime(1000);
      expect(FakeWebSocket.instances.length).toBe(3);
    });

    it('resets the backoff once a socket opens', () => {
      service.connect('wss://localhost/midas-ws');

      FakeWebSocket.instances[0].drop();
      jest.advanceTimersByTime(1000);
      FakeWebSocket.instances[1].onopen?.();

      FakeWebSocket.instances[1].drop();
      jest.advanceTimersByTime(1000);

      expect(FakeWebSocket.instances.length).toBe(3);
    });
  });

  describe('waking up', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
      jest.useRealTimers();
      setVisibility('visible');
    });

    it('reopens a socket that died without firing onclose', () => {
      service.connect('wss://localhost/midas-ws');
      FakeWebSocket.instances[0].dieSilently();

      setVisibility('hidden');
      setVisibility('visible');

      expect(FakeWebSocket.instances.length).toBe(2);
    });

    it('leaves a healthy socket alone', () => {
      service.connect('wss://localhost/midas-ws');

      setVisibility('hidden');
      setVisibility('visible');

      expect(FakeWebSocket.instances.length).toBe(1);
    });

    it('reopens when the network comes back', () => {
      service.connect('wss://localhost/midas-ws');
      FakeWebSocket.instances[0].dieSilently();

      window.dispatchEvent(new Event('online'));

      expect(FakeWebSocket.instances.length).toBe(2);
    });

    it('does not wait out the backoff when the tab returns', () => {
      service.connect('wss://localhost/midas-ws');

      // two failed retries push the delay out to 4s
      FakeWebSocket.instances[0].drop();
      jest.advanceTimersByTime(1000);
      FakeWebSocket.instances[1].drop();
      jest.advanceTimersByTime(2000);
      expect(FakeWebSocket.instances.length).toBe(3);

      FakeWebSocket.instances[2].drop();
      setVisibility('visible');

      // reconnected immediately rather than after the pending timer
      expect(FakeWebSocket.instances.length).toBe(4);
    });
  });
});
