import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { IndexService } from '@app/services/index/index.service';
import { of } from 'rxjs';
import { MainPageComponent } from './main-page.component';

import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let indexServiceSpy: SpyObj<IndexService>;
    // let drawingServiceStub: DrawingService;

    beforeEach(
        waitForAsync(() => {
            indexServiceSpy = jasmine.createSpyObj('IndexService', ['basicGet', 'basicPost']);
            indexServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
            indexServiceSpy.basicPost.and.returnValue(of());

            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientModule, RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }])],
                declarations: [MainPageComponent],
                providers: [{ provide: IndexService, useValue: indexServiceSpy }],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call basicGet when calling getMessagesFromServer', () => {
        component.getMessagesFromServer();
        expect(indexServiceSpy.basicGet).toHaveBeenCalled();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(indexServiceSpy.basicPost).toHaveBeenCalled();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'Poly Dessin LOG2990'", () => {
        expect(component.title).toEqual('PolyDessin LOG2990');
    });

    it("should have button called 'Créer un nouveau dessin'", () => {
        expect(component.newOption).toEqual('Créer un nouveau dessin');
    });

    it("should have button called 'Continuer un dessin'", () => {
        expect(component.continueOption).toEqual('Continuer un dessin');
    });

    it('Placeholder value should change when clicking on button (Carrousel de Dessin)', () => {
        component.openDrawingSet();
        expect(component.placeholder).toEqual('Does nothing for Sprint 1. Next sprint, it should open a new page.');
    });
    it('If the button (Continuer dessin) is pressed, newCanvas becomes false.', () => {
        component.goEditorContinue();
        expect(component.newCanvas).toBeFalse();
    });
    it('If the button ( Creer un Nouveau Dessin) is pressed, newCanvas becomes true.', () => {
        component.goEditorNew();
        expect(component.newCanvas).toBeTrue();
    });

    it('should get stored image data and put it on the canvas', () => {
        const getImageSpy = spyOn(localStorage, 'getItem').and.callThrough();
        component.continueDraw();
        expect(getImageSpy).toHaveBeenCalled();
    });
    it('should set canvas parameters to DEFAULT values', () => {
        const canvasWidthStub = 1000;
        const canvasHeightStub = 600;
        component.newDraw();
        expect(component.drawingService.canvasSize.x).toEqual(canvasWidthStub);
        expect(component.drawingService.canvasSize.y).toEqual(canvasHeightStub);
    });
});
