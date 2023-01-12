import * as http from 'http';
import * as io from 'socket.io';
import { SocketManager } from './socket-manager.service';

type CallbackSignature = (...params: unknown[]) => {};

class SocketServer {
    socket = new SocketMock();
    private callbacks = new Map<string, [SocketMock, CallbackSignature]>();
    on(event: string, callback: CallbackSignature): void {
        this.callbacks.set(event, [this.socket, callback]);
    }

    // eslint-disable-next-line no-unused-vars
    emit(event: string, ...params: unknown[]): void {
        const tuple = this.callbacks.get(event) as [SocketMock, CallbackSignature];
        tuple[1](tuple[0]);
    }
    // eslint-disable-next-line no-unused-vars
    to(...args: unknown[]): SocketServer {
        return new SocketServer();
    }
}

class SocketMock {
    id: string = 'Socket mock';
    events: Map<string, CallableFunction> = new Map();
    // eslint-disable-next-line no-unused-vars
    emit(event: string, ...params: unknown[]): void {
        return;
    }

    on(eventName: string, cb: CallableFunction) {
        this.events.set(eventName, cb);
    }

    peerSideEmit(eventName: string, ...args: unknown[]) {
        const arrowFunction = this.events.get(eventName) as CallableFunction;
        arrowFunction(...args);
    }

    // eslint-disable-next-line no-unused-vars
    join(...args: unknown[]) {
        return;
    }

    // eslint-disable-next-line no-unused-vars
    leave(...args: unknown[]) {
        return;
    }

    disconnect() {
        return;
    }
}

describe('Socket Manager', () => {
    let socketManager: SocketManager;
    const socketServer = new SocketServer();
    beforeEach(() => {
        
        const ioSPy = new http.Server();
        socketManager = new SocketManager(
            ioSPy as unknown as http.Server,
        );

        
        socketManager.sio = socketServer as unknown as io.Server;;
    });

    
});
