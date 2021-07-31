import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Image } from '@app/classes/constant';
import { ImageId } from '@common/communication/image';
import { Subject } from 'rxjs';
import { ServerCommunicationService } from './server-communication.service';

describe('ServerCommunicationService', () => {
    let service: ServerCommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
        });
        service = TestBed.inject(ServerCommunicationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getObserverFromServerWritingImage should make a post request', () => {
        // tslint:disable-next-line: no-any
        const sub = new Subject<any>();
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(service['http'], 'post').and.callFake(() => {
            return sub.asObservable();
        });
        service.getObserverFromServerWritingImage({} as Image);
        expect(spy).toHaveBeenCalled();
    });

    it('getObserverFromServerGetAllImageWithData should make a GET request', () => {
        // tslint:disable-next-line: no-any
        const sub = new Subject<any>();
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(service['http'], 'get').and.callFake(() => {
            return sub.asObservable();
        });
        service.getObserverFromServerGetAllImageWithData();
        expect(spy).toHaveBeenCalled();
    });

    it('deleteObserverFromServerDeleteDatabaseAndServer should make a DELETE request', () => {
        // tslint:disable-next-line: no-any
        const sub = new Subject<any>();
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(service['http'], 'delete').and.callFake(() => {
            return sub.asObservable();
        });
        service.deleteObserverFromServerDeleteDatabaseAndServer({} as ImageId);
        expect(spy).toHaveBeenCalled();
    });

    it('getObserverFromServerWritingImageImgur should make a post request in the irmur server', () => {
        // tslint:disable-next-line: no-any
        const sub = new Subject<any>();
        // tslint:disable-next-line: no-string-literal
        const spy = spyOn(service['http'], 'post').and.callFake(() => {
            return sub.asObservable();
        });
        service.getObserverFromServerWritingImageImgur('test');
        expect(spy).toHaveBeenCalled();
    });
});
