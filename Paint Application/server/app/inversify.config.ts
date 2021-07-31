import { DrawController } from '@app/controllers/draw.controler';
import { DrawService } from '@app/services/draw.service';
import { Container } from 'inversify';
import { Application } from './server/app';
import { Server } from './server/server';
import { DatabaseService } from './services/database.service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    container.bind(TYPES.DrawController).to(DrawController);

    container.bind(TYPES.DrawService).to(DrawService);
    container.bind(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();

    return container;
};
