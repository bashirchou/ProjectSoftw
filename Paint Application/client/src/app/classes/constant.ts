import { ImageDb } from '@common/communication/image';
import { Tag } from './tag';

export enum ToolSelector {
    Pensil = 0,
    Rectangle,
    Line,
    Group,
    Ellipse,
    Eraser,
    Pipette,
    NoTool,
    Polygone,
    Selector,
    Aerosol,
    PaintingBucket,

    Texte,
    Etampe,
}
export enum GroupSelector {
    Tracer,
    Shape,
    Etampes,
    NotAGroup,
}
export const DEFAULT_TOOL = ToolSelector.Pensil;

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum ShapeType {
    Border,
    Full,
    Border_full,
}

export const shapeTypeString = new Map([
    [ShapeType.Border, 'Contour'],
    [ShapeType.Full, 'Plein'],
    [ShapeType.Border_full, 'Plein avec contour'],
]);

export enum SelectorType {
    Rectangle,
    Ellipse,
    All,
    Polygonal,
}

export const selectorTypeString = new Map([
    [SelectorType.Rectangle, 'Rectangle'],
    [SelectorType.Ellipse, 'Éllipse'],
    [SelectorType.All, 'Selectionner tout'],
    [SelectorType.Polygonal, 'Lasso Polygonal'],
]);

export enum ControlPointLocation {
    none,
    topRight,
    topLeft,
    bottomRight,
    bottomLeft,
    middleTop,
    middleLeft,
    middleRight,
    middleBottom,
}

export enum Polygontype {
    Triangle,
    Square,
    Pentagon,
    Hexagon,
    heptagon,
    Octagon,
    Nonagon,
    Decagon,
    Hendecagon,
    Dodecagon,
}
export const polygonTypeString = new Map([
    [Polygontype.Triangle, 'Triangle'],
    [Polygontype.Square, 'Carré'],
    [Polygontype.Pentagon, 'Pentagone'],
    [Polygontype.Hexagon, 'Hexagone'],
    [Polygontype.heptagon, 'heptagone'],
    [Polygontype.Octagon, 'Octogone'],
    [Polygontype.Nonagon, 'Nonagone'],
    [Polygontype.Decagon, 'Dacagone'],
    [Polygontype.Hendecagon, 'Hendecagone'],
    [Polygontype.Dodecagon, 'Dodecagone'],
]);
export enum JonctionType {
    Normal = 0,
    WithPoints,
}
export const jonctionTypeString = new Map([
    [JonctionType.Normal, 'Normal'],
    [JonctionType.WithPoints, 'Avec points'],
]);

export const toolShorcuts = new Map([
    ['1', ToolSelector.Rectangle],
    ['c', ToolSelector.Pensil],
    ['2', ToolSelector.Ellipse],
    ['l', ToolSelector.Line],
    ['e', ToolSelector.Eraser],
    ['3', ToolSelector.Polygone],
    ['i', ToolSelector.Pipette],
    ['a', ToolSelector.Aerosol],
    ['r', ToolSelector.Selector],
    ['s', ToolSelector.Selector],
    ['control a', ToolSelector.Selector],
    ['control v', ToolSelector.Selector],
    ['b', ToolSelector.PaintingBucket],
    ['d', ToolSelector.Etampe],
    ['t', ToolSelector.Texte],
]);

export const stampSelection = new Map([
    [0, '/assets/htmLogo.png'],
    [1, '/assets/gentelman.png'],
    [2, '/assets/manger.png'],
    // tslint:disable-next-line: no-magic-numbers
    [3, '/assets/laptop.png'],
    // tslint:disable-next-line: no-magic-numbers
    [4, '/assets/course.png'],
]);

export const maxTimeToWaitForServer = 3000;

export const supportedChromeCanvasImages = new Map<string, string>([
    ['png', 'image/png'],
    ['jpeg', 'image/jpeg'],
    ['webp', 'image/webp'],
]);

export const errorMessages = new Map<string, string>([
    ['TimeoutError', 'Impossible de ce connecter au serveur (temps attente ' + maxTimeToWaitForServer + ' ms )'],
]);

export interface Image {
    title: string;
    tags: string[];
    data: string;
}
export interface DialogDataSaveServer {
    name: string;
    tags: Tag[];
    imageFormat: string;
}
export interface DialogDataDisplayServer {
    listImage: ImageDb[];
    tagsCarousel: Tag[];
}

export interface ImgurDataPost {
    data: DataImgur;
    success: boolean;
    status: number;
}

export interface DataImgur {
    id: string;
    title: string;
    description: string;
    datetime: number;
    type: string;
    animated: boolean;
    width: number;
    height: number;
    size: number;
    views: number;
    bandwidth: number;
    vote: null;
    favorite: boolean;
    nsfw: null;
    section: null;
    account_url: null;
    account_id: number;
    is_ad: boolean;
    in_most_viral: boolean;
    tags: [];
    ad_type: number;
    ad_url: string;
    in_gallery: boolean;
    deletehash: string;
    name: string;
    link: string;
}

export interface DialogDataDeleteServer {
    listImage: ImageDb[];
}
export interface DialogDataMessge {
    title: string;
    message: string;
}

export enum ApplicationShortcut {
    undo = 'control z',
    redo = 'control shift z',
    save = 'control s',
    newDraw = 'control o',
    exportDraw = 'control e',
    carousel = 'control g',
    load = 'control p',
}
export const alphaPos = 3;
export const maxColorValue = 255;
export const pixelLenght = 4;

export const leftMouseClick = 0;
export const rightMouseClick = 2;

export const imageSizeMultiplicator = 15;
export const DEFAULT_IMAGE_HEIGTH = 100;
export const DEFAULT_IMAGE_WIDTH = 150;
export const DEFAULT_RADIAN_ANGLE = 0;
export const DEFAULT_RADIAN_SCROLL_ANGLE = 0.261799;
export const SLOW_RADIAN_SCROLL_ANGLE = 0.0174533;
export const ETAMP_INITIAL_SIZE = 3;

export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 600;
export const dimension = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
export const ADJUSTEMENT_POINT = 1; // Cant do a lineTo to himself.
export const ADJUSTEMENT_LINE = 0.001; // Cant do a LineTo to himself.
export const ANGLE_PI_OVER_TWO = Math.PI / 2;
export const ANGLE_PI_OVER_FOUR = ANGLE_PI_OVER_TWO / 2;
export const ANGLE_PI_OVER_EIGHT = ANGLE_PI_OVER_FOUR / 2;
export const ANGLE_PI = Math.PI;
export const MIN_CANVAS_WIDTH = 250;
export const MIN_CANVAS_HEIGHT = 250;
export const CANVAS_WIDTH_RECISE = 200;
export const CANVAS_HEIGHT_RECISE = 200;
