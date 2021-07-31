import { TYPES } from '@app/types';
import { expect } from 'chai';
import { testingContainer } from '../../test/test-utils';
import { DatabaseService } from './database.service';

describe('DrawService', () => {
    let databaseService: DatabaseService;

    beforeEach(async () => {
        const [container] = await testingContainer();
        databaseService = container.get<DatabaseService>(TYPES.DatabaseService);
    });

    it('should start the server', (done: Mocha.Done) => {
        databaseService.start().then(() => {
            // tslint:disable-next-line: no-string-literal
            expect(databaseService['client'] != undefined && databaseService['db'] != undefined);
            done();
        });
    });

    it('should return the database', (done: Mocha.Done) => {
        // tslint:disable-next-line: no-string-literal
        expect(databaseService.database === databaseService['db']);
        done();
    });
});
