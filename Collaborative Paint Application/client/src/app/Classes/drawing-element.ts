import { PathInfo } from '../../../../common/communication/PathInfo';
import { Coord } from './coord';
import { DynamicElement } from './dynamic-element';

export abstract class DrawingElement extends DynamicElement {

    private readonly outputPrecision: number = 4;
    private readonly aIndex: number = 0;
    private readonly bIndex: number = 1;
    private readonly cIndex: number = 2;
    private readonly dIndex: number = 3;
    private readonly eIndex: number = 4;
    private readonly fIndex: number = 5;
    // tslint:disable-next-line: no-magic-numbers
    private readonly DEG_TO_RAD: number = Math.PI / 180;
    private readonly MATRIX_PREFIX: string = 'matrix';
    private readonly IDENTITY_TRANSFORMATION: string = 'matrix(1,0,0,1,0,0)';
    fill: string; 
    color: string;
    strokeWidth: number;
    transformation: string;

    constructor() {
        super();
        this.strokeWidth = 0;
        this.transformation = this.IDENTITY_TRANSFORMATION;
    }

    abstract getStrokeWidth(): number;

    abstract initOnLoad(pathInfo: PathInfo): void;

    abstract clone(elementInfo: DrawingElement): void;

    rotate(degree: number, around: Coord): void {
        const radians = degree * this.DEG_TO_RAD;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const rotationCoefficients: number[] = [cos, sin, -sin, cos, 0, 0];

        this.translate(new Coord(-around.x, -around.y));
        this.addTransformation(rotationCoefficients);
        this.translate(around);
    }

    translate(translation: Coord): void {
        const translationCoefficients: number[] = [1, 0, 0, 1, translation.x, translation.y];
        this.addTransformation(translationCoefficients);
    }
    changeColor(primaryColor:string, secondaryColor: string): void{
        this.color = primaryColor;
        this.fill = secondaryColor;
    }

    // The input array should only contain 6 coefficients that follow a normal matrix format
    // since the matrix transformation of the SVG specification is as such: matrix(a,b,c,d,e,f):
    // a c e
    // b d f
    // 0 0 1
    private addTransformation(toAdd: number[]): void {
        const current: number[] = this.transformation
            .substring(this.MATRIX_PREFIX.length + 1, this.transformation.length - 1)
            .split(',')
            .map((stringValue) => Number(stringValue));

        const newA = (toAdd[this.aIndex] * current[this.aIndex]) + (toAdd[this.cIndex] * current[this.bIndex]);
        const newB = (toAdd[this.bIndex] * current[this.aIndex]) + (toAdd[this.dIndex] * current[this.bIndex]);
        const newC = (toAdd[this.aIndex] * current[this.cIndex]) + (toAdd[this.cIndex] * current[this.dIndex]);
        const newD = (toAdd[this.bIndex] * current[this.cIndex]) + (toAdd[this.dIndex] * current[this.dIndex]);
        const newE = (toAdd[this.aIndex] * current[this.eIndex]) + (toAdd[this.cIndex] * current[this.fIndex]) + toAdd[this.eIndex];
        const newF = (toAdd[this.bIndex] * current[this.eIndex]) + (toAdd[this.dIndex] * current[this.fIndex]) + toAdd[this.fIndex];
        this.transformation = 'matrix('
            + `${newA.toFixed(this.outputPrecision)},${newB.toFixed(this.outputPrecision)},`
            + `${newC.toFixed(this.outputPrecision)},${newD.toFixed(this.outputPrecision)},`
            + `${newE.toFixed(this.outputPrecision)},${newF.toFixed(this.outputPrecision)}`
            + ')';
    }
}
