import { PathInfo } from '../../../../common/communication/PathInfo';
import { Coord } from './coord';
import { DrawingElement } from './drawing-element';

class DummyDrawingElement extends DrawingElement {
    clone(elementInfo: DrawingElement): void {
        throw new Error('Method not implemented.');
    }
    initOnLoad(pathInfo: PathInfo): void {
        throw new Error('Method not implemented.');
    }
    getStrokeWidth(): number {
        return this.strokeWidth;
    }
}

describe('DrawingElement', () => {
    const identityMatrix = 'matrix(1,0,0,1,0,0)';
    const translation = 5;
    const translate = new Coord(translation, translation);
    let component: DummyDrawingElement;

    beforeEach(() => {
        component = new DummyDrawingElement();
    });

    it('#updateTranslation should update the last translation', () => {
        expect(component.transformation).toBe(identityMatrix);
        component.translate(translate);
        expect(component.transformation).toBe('matrix(1.0000,0.0000,0.0000,1.0000,5.0000,5.0000)');
        component.translate(translate);
        expect(component.transformation).toBe('matrix(1.0000,0.0000,0.0000,1.0000,10.0000,10.0000)');
    });


});
