import {Application} from '@app/app';
import * as http from 'http';
import {AddressInfo} from 'net';
import {Service} from 'typedi';
import {SocketManager} from '@app/services/socket-manager.service';
import {UserManager} from '@app/services/userManagement/user-manager.service';
import {DatabaseService} from '@app/services/database.service';
import {AlbumManager} from '@app/services/albumManager/album-manager.service';
import {ConversationsManager} from '@app/services/messageManager/conversations-manager.service';
import {AlbumService} from './services/albumService/album.service';
import {DrawingService} from './services/drawingService/drawing.service';
import {UserService} from './services/userService/user.service';
import {MessageService} from './services/discussionService/message.service';
// import {DiscussionService} from './services/discussionService/discussion.service';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly baseDix: number = 10;
    private server: http.Server;
    private socketManager: SocketManager;


    // Add a list of all socket conected here

    constructor (
        private readonly application: Application,
        private userManager: UserManager,
        private databaseService: DatabaseService,
        private conversationManager: ConversationsManager,
        private albumManager: AlbumManager,
        private albumService: AlbumService,
        private drawingService: DrawingService,
        private userService: UserService,
        private messageService: MessageService
        // private discussionService: DiscussionService
    ) {}

    private static normalizePort (val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init (): Promise<void> {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);
        //this.conversationManager = new ConversationsManager(this.databaseService, this.discussionService);
        this.socketManager = new SocketManager(
            this.server, this.userManager, this.conversationManager,
            this.albumManager, this.albumService, this.drawingService, this.userService, this.messageService
        );
        this.socketManager.handleSockets();

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
        try {
            await this.databaseService.start();
            // eslint-disable-next-line no-console
            console.log('Database connection successful !');
        } catch {
            // eslint-disable-next-line no-console
            console.error('Database connection failed !');
            process.exit(1);
        }
        await this.userManager.populateFromDB();
        await this.albumManager.populateFromDB();
        await this.conversationManager.populateFromDB();
    }

    private onError (error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
        case 'EACCES':
            // eslint-disable-next-line no-console
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            // eslint-disable-next-line no-console
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening (): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
