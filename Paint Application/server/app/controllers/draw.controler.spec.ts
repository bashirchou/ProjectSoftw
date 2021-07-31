import { BAD_REQUEST, HTTP_STATUS_CREATED, HTTP_STATUS_DELETED, HTTP_STATUS_ERROR, HTTP_STATUS_OK } from '@app/classes/constant';
import { Application } from '@app/server/app';
import { TYPES } from '@app/types';
import { Image, ImageDb } from '@common/communication/image';
import * as supertest from 'supertest';
import { testingContainer } from '../../test/test-utils';

describe('DrawController', () => {
    let app: Express.Application;
    const baseImage = {
        title: 'image',
        tags: ['tag'],
        data:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAYAAACI7Fo9AAAHa0lEQVR4Xu3aUYoUaxCE0ZqViTtzZ+LOpIV5Ee1uiqoIMY5P92Gmk/9kfujV+Tj8IkDgvxf4+O9f6IEECBxCdwQEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6w5H/0id+O4/hyHMeP4zge/+3XjQJCvxHXR78UEPtLomu+QOjXOPqU8wKfv5v7Xf284cvvFPpLIl9ws4DQbwZ+fLzQA8hGPBX4/OP7V073CQj9Pluf/L7Ad38p9z7Wma8U+hk133O1gD++Xy362+cJ/WZgH/+WgNDfYjr/RUI/b+c7rxMQ+nWWf/wkod8M7OPfEvD/6G8xnf8ioZ+3853XCPhb92scn36K0APIRjwV8Lt54ECEHkA24q8/y/74WffHL/+GfvORCP1mYB//S+DZj7f60dfAkQg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gI/Aa/AE/sRu5HxAAAAAElFTkSuQmCC',
    } as Image;

    const baseImageDb = {
        title: 'image',
        tags: ['tag'],
        data:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAYAAACI7Fo9AAAHa0lEQVR4Xu3aUYoUaxCE0ZqViTtzZ+LOpIV5Ee1uiqoIMY5P92Gmk/9kfujV+Tj8IkDgvxf4+O9f6IEECBxCdwQEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6wZE8kIHQ3QGBAQOgDS/ZEAkJ3AwQGBIQ+sGRPJCB0N0BgQEDoA0v2RAJCdwMEBgSEPrBkTyQgdDdAYEBA6ANL9kQCQncDBAYEhD6w5H/0id+O4/hyHMeP4zge/+3XjQJCvxHXR78UEPtLomu+QOjXOPqU8wKfv5v7Xf284cvvFPpLIl9ws4DQbwZ+fLzQA8hGPBX4/OP7V073CQj9Pluf/L7Ad38p9z7Wma8U+hk133O1gD++Xy362+cJ/WZgH/+WgNDfYjr/RUI/b+c7rxMQ+nWWf/wkod8M7OPfEvD/6G8xnf8ioZ+3853XCPhb92scn36K0APIRjwV8Lt54ECEHkA24q8/y/74WffHL/+GfvORCP1mYB//S+DZj7f60dfAkQg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gJCb2/AfAIBAaEHkI0g0BYQensD5hMICAg9gGwEgbaA0NsbMJ9AQEDoAWQjCLQFhN7egPkEAgJCDyAbQaAtIPT2BswnEBAQegDZCAJtAaG3N2A+gYCA0APIRhBoCwi9vQHzCQQEhB5ANoJAW0Do7Q2YTyAgIPQAshEE2gI/Aa/AE/sRu5HxAAAAAElFTkSuQmCC',
        fileExtension: 'png',
        _id: '605a7ab404a6f91fe8b17cb8',
    } as ImageDb;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            writeImageDataDisk: sandbox.stub().resolves(),
            writeImageInDataBase: sandbox.stub().resolves(baseImage),
            readAll: sandbox.stub().resolves(),
            deleteImageOnDisk: sandbox.stub().resolves([baseImageDb]),
            deleteImageInDataBase: sandbox.stub().resolves(baseImageDb),
        });
        container.rebind(TYPES.DatabaseService).toConstantValue({
            writeInDatase: sandbox.stub().resolves(baseImage),
            deleteImageInDataBase: sandbox.stub().resolves(baseImageDb),
        });
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should write the Image on the server if it is valid', async () => {
        return supertest(app).post('/api/draw/write').send(baseImage).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
    });

    it('should return a bad request if there is nothing sent', async () => {
        return supertest(app).post('/api/draw/write').send().set('Accept', 'application/json').expect(BAD_REQUEST);
    });

    it('should return a bad request if there is no title for the image', async () => {
        const invalidImage = {
            title: '',
            tags: ['tag'],
            data:
                'data:image/png;base64,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',
        };
        return supertest(app).post('/api/draw/write').send(invalidImage).set('Accept', 'application/json').expect(BAD_REQUEST);
    });

    it('should return a bad request if there is no data for the image', async () => {
        const invalidImage = {
            title: 'test',
            tags: ['tag'],
        };
        return supertest(app).post('/api/draw/write').send(invalidImage).set('Accept', 'application/json').expect(BAD_REQUEST);
    });

    it('should return a bad request if there is no attribut tags', async () => {
        const invalidImage = {
            title: 'test',
            data:
                'data:image/png;base64,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',
        };
        return supertest(app).post('/api/draw/write').send(invalidImage).set('Accept', 'application/json').expect(BAD_REQUEST);
    });

    it('should return a bad request if the image cannot be convert to Image', async () => {
        const invalidImage = {
            title: 'test',
            tag: [''],
            data:
                'data:image/png;base64,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',
        };
        return supertest(app).post('/api/draw/write').send(invalidImage).set('Accept', 'application/json').expect(BAD_REQUEST);
    });

    it('should read all the image from server and database if the connection is valid', async () => {
        return supertest(app).get('/api/draw/readAll').set('Accept', 'application/json').expect(HTTP_STATUS_OK);
    });

    it('should handle a unexpected writeImageDataDisk error', async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            writeImageDataDisk: sandbox.stub().callsFake(() => {
                throw new Error();
            }),
        });
        app = container.get<Application>(TYPES.Application).app;

        return supertest(app).post('/api/draw/write').send(baseImage).set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);
    });

    it('should handle a reject writeImageDataDisk error', async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            writeImageDataDisk: sandbox.stub().rejects(),
        });
        app = container.get<Application>(TYPES.Application).app;

        return supertest(app).post('/api/draw/write').send(baseImage).set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);
    });

    it('should handle a unexpected writeImageInDataBase error', async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            writeImageInDataBase: sandbox.stub().callsFake(() => {
                throw new Error();
            }),
        });
        app = container.get<Application>(TYPES.Application).app;

        return supertest(app).post('/api/draw/write').send(baseImage).set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);
    });

    it('should handle a reject writeImageInDataBase error', async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            writeImageInDataBase: sandbox.stub().rejects(),
        });
        app = container.get<Application>(TYPES.Application).app;

        return supertest(app).post('/api/draw/write').send(baseImage).set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);
    });

    it('should handle a unexpected readall error', async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            readAll: sandbox.stub().callsFake(() => {
                throw new Error();
            }),
        });
        app = container.get<Application>(TYPES.Application).app;

        return supertest(app).get('/api/draw/readAll').set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);
    });

    it('should handle a reject readall error', async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            readAll: sandbox.stub().rejects(),
        });
        app = container.get<Application>(TYPES.Application).app;

        return supertest(app).get('/api/draw/readAll').set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);
    });

    it('should return the OK code if the image was succesfuly delete', async () => {
        return supertest(app)
            .delete('/api/draw/delete/' + baseImageDb._id)
            .set('Accept', 'application/json')
            .expect(HTTP_STATUS_DELETED);
    });
    it('should return ERROR if there is no body for delete', async () => {
        return supertest(app).delete('/api/draw/delete/').set('Accept', 'application/json').expect(HTTP_STATUS_ERROR);
    });

    it('should handle a reject deleteImageOnDisk error', async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DrawService).toConstantValue({
            deleteImageOnDisk: sandbox.stub().rejects(),
        });
        app = container.get<Application>(TYPES.Application).app;

        return supertest(app)
            .delete('/api/draw/delete/' + baseImageDb._id)
            .set('Accept', 'application/json')
            .expect(HTTP_STATUS_ERROR);
    });
});
