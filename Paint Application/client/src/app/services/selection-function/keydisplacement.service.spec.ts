import { TestBed } from '@angular/core/testing';
import { ArrowDirection } from '@app/classes/arrow-direction';
import { KeyDisplacementService } from './keydisplacement.service';
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
describe('KeyDisplacementService', () => {
    let service: KeyDisplacementService;
    let arrowDirection: ArrowDirection;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(KeyDisplacementService);
        arrowDirection = { r: false, l: false, u: false, d: false };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Timer100ms should put canMove to true', () => {
        service.canMove = false;
        jasmine.clock().install();
        service.timer100ms();
        jasmine.clock().tick(100);
        expect(service.canMove).toBeTrue();
        jasmine.clock().uninstall();
    });
    it('Timer should put canMove to true', () => {
        service.canMove = false;
        jasmine.clock().install();
        service.timer();
        jasmine.clock().tick(500);
        expect(service.canMove).toBeTrue();
        jasmine.clock().uninstall();
    });

    it(' on arrowKeyAssignation if right arrow is down, arrowdirection right suppose to be true', () => {
        const keyBoardEvent = { key: 'ArrowRight' } as KeyboardEvent;
        service.arrowKeyAssignation(keyBoardEvent, true, arrowDirection);
        expect(arrowDirection.r).toEqual(true);
    });
    it(' on arrowKeyAssignation if left arrow is down, arrowdirection left suppose to be true', () => {
        const keyBoardEvent = { key: 'ArrowLeft' } as KeyboardEvent;
        service.arrowKeyAssignation(keyBoardEvent, true, arrowDirection);
        expect(arrowDirection.l).toEqual(true);
    });
    it(' on arrowKeyAssignation if up arrow is down, arrowdirection up suppose to be true', () => {
        const keyBoardEvent = { key: 'ArrowUp' } as KeyboardEvent;
        service.arrowKeyAssignation(keyBoardEvent, true, arrowDirection);
        expect(arrowDirection.u).toEqual(true);
    });
    it(' on arrowKeyAssignation if down arrow is down, arrowdirection down suppose to be true', () => {
        const keyBoardEvent = { key: 'ArrowDown' } as KeyboardEvent;
        service.arrowKeyAssignation(keyBoardEvent, true, arrowDirection);
        expect(arrowDirection.d).toEqual(true);
    });
});
