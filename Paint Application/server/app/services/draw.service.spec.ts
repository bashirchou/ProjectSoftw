import { TYPES } from '@app/types';
import { Image, ImageDb } from '@common/communication/image';
import { expect } from 'chai';
import { existsSync, unlinkSync, writeFile } from 'fs';
import { testingContainer } from '../../test/test-utils';
import { DrawService } from './draw.service';

describe('DrawService', () => {
    let drawService: DrawService;
    const baseImageDb = {
        title: 'image',
        tags: ['tag'],
        data:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAYAAACI7Fo9AAAHa0lEQVR4Xu3aUYoUaxCE0ZqViTtzZ+LOpIV5Ee1uiqoIMY5P92Gmk/9kfujV+Tj8IkDgvxf4+O9f6IEECBxCdwQEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6w5H/0id+O4/hyHMeP4zge/+3XjQJCvxHXR78UEPtLomu+QOjXOPqU8wKfv5v7Xf284cvvFPpLIl9ws4DQbwZ+fLzQA8hGPBX4/OP7V073CQj9Pluf/L7Ad38p9z7Wma8U+hk133O1gD++Xy362+cJ/WZgH/+WgNDfYjr/RUI/b+c7rxMQ+nWWf/wkod8M7OPfEvD/6G8xnf8ioZ+3853XCPhb92scn36K0APIRjwV8Lt54ECEHkA24q8/y/74WffHL/+GfvORCP1mYB//S+DZj7f60dfAkQg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gI/Aa/AE/sRu5HxAAAAAElFTkSuQmCC',
        fileExtension: 'png',
        _id: '605a7ab404a6f91fe8b17cb8',
    } as ImageDb;

    const baseImage = {
        title: 'image',
        tags: ['tag'],
        data:
            'data:image/png;base64,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',
    } as Image;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            writeInDatase: sandbox.stub().resolves(baseImageDb),
            getAllImageDataBase: sandbox.stub().resolves([baseImageDb]),
            deleteInDataBase: sandbox.stub().resolves(baseImageDb),
        });
        drawService = container.get<DrawService>(TYPES.DrawService);
    });

    it('should write the data the the server disk', (done: Mocha.Done) => {
        drawService.writeImageDataDisk(baseImageDb).then(() => {
            try {
                expect(existsSync(drawService.dataPath + baseImageDb._id + '.' + baseImageDb.fileExtension));
                drawService.deleteImageOnDisk(baseImageDb._id, baseImageDb.fileExtension);
            } catch (err) {
                console.error(err);
            }
            done();
        });
    });

    it('should create a directory for data it it does not exits', (done: Mocha.Done) => {
        const savePath = drawService.dataPath;
        drawService.dataPath = 'anything/';
        // tslint:disable-next-line: no-require-imports
        const rimraf = require('rimraf');

        rimraf.sync(drawService.dataPath);
        drawService.writeImageDataDisk(baseImageDb).then(() => {
            try {
                expect(existsSync(drawService.dataPath + baseImageDb._id + '.' + baseImageDb.fileExtension));
            } catch (err) {
                console.error(err);
            }
            rimraf.sync(drawService.dataPath);
            drawService.dataPath = savePath;
            done();
        });
    });

    it('should write the data in the mongoDb and return the MongaDb image writen', (done: Mocha.Done) => {
        drawService.writeImageInDataBase(baseImage).then((image: ImageDb) => {
            const validReturn =
                image.title === baseImage.title &&
                image.tags === baseImage.tags &&
                image.data === baseImage.data &&
                image.fileExtension === baseImageDb.fileExtension &&
                image._id === baseImageDb._id;
            expect(validReturn);
            done();
        });
    });

    it('should get all image from the database', (done: Mocha.Done) => {
        drawService.getAllImageDataBase().then((imageArray: ImageDb[]) => {
            expect(imageArray.length === 1 && imageArray[0] === baseImageDb);
            done();
        });
    });

    it('should delete the image from the database', (done: Mocha.Done) => {
        drawService.deleteImageInDataBase({ imageId: baseImageDb._id }).then((image: ImageDb) => {
            expect(image === baseImageDb);
            done();
        });
    });

    it('should check if the file exist', (done: Mocha.Done) => {
        const path = 'data/helloworld.txt';
        writeFile(path, 'Hello World!', (err: Error) => {
            if (err) return console.log(err);
        });
        expect(drawService.fileExist(path));
        expect(!drawService.fileExist('dnwajkdnawjnd.txt'));
        try {
            unlinkSync(path);
        } catch (err) {
            console.error(err);
        }
        done();
    });
    it('should delete the image on the disk', (done: Mocha.Done) => {
        const path = drawService.dataPath + 'test.txt';
        writeFile(path, 'Hello World!', (err: Error) => {
            if (err) return console.log(err);
        });
        drawService.deleteImageOnDisk('test', 'txt').then(() => {
            expect(!drawService.fileExist(path));
            done();
        });
    });

    it('should return all filenames with their extension in the directory', (done: Mocha.Done) => {
        const path = drawService.dataPath + 'test.txt';
        const path2 = drawService.dataPath + 'test2.txt';

        writeFile(path, 'Hello World!', (err: Error) => {
            if (err) return console.log(err);
        });
        writeFile(path2, 'Hello World!', (err: Error) => {
            if (err) return console.log(err);
        });
        drawService.getAllImageTitleAndFileExtension().then((namesArray: string[]) => {
            expect(namesArray[0] === 'test.txt' && namesArray[1] === 'test2.txt');
        });
        try {
            unlinkSync(path);
        } catch (err) {
            console.error(err);
        }
        try {
            unlinkSync(path2);
        } catch (err) {
            console.error(err);
        }
        done();
    });

    it('should return all images with there data', (done: Mocha.Done) => {
        drawService.writeImageDataDisk(baseImageDb).then(() => {
            drawService
                .readAll()
                .then((imageArray: ImageDb[]) => {
                    expect(imageArray[0] === baseImageDb);
                    done();
                })
                .then(() => {
                    drawService.deleteImageOnDisk(baseImageDb._id, baseImageDb.fileExtension);
                });
        });
    });
});
