import { BAD_REQUEST, HTTP_STATUS_CREATED, HTTP_STATUS_DELETED, HTTP_STATUS_ERROR, HTTP_STATUS_OK } from '@app/classes/constant';
import { DrawService } from '@app/services/draw.service';
import { TYPES } from '@app/types';
import { Image, ImageDb, ImageId } from '@common/communication/image';
import { Message } from '@common/communication/message';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class DrawController {
    router: Router;

    constructor(@inject(TYPES.DrawService) private drawService: DrawService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/write', (req: Request, res: Response, next: NextFunction) => {
            if (!req.body) return res.sendStatus(BAD_REQUEST).send('There should be a body');
            const image = req.body as Image;
            if (image.title == undefined || image.title === '') return res.status(BAD_REQUEST).send('There should be title');
            if (image.data == undefined || image.data === '') return res.status(BAD_REQUEST).send('There should be image data');
            if (image.tags == undefined) return res.status(BAD_REQUEST).send('There should be a tag attribut');

            return this.drawService
                .writeImageInDataBase(image)
                .then((imageDb: ImageDb) => {
                    this.drawService.writeImageDataDisk(imageDb).then(() => {
                        return res.status(HTTP_STATUS_CREATED).json({});
                    });
                })
                .catch((reason: unknown) => {
                    const errorMessage: Message = {
                        title: 'The image could not be written in the server',
                        body: reason as string,
                    };
                    return res.status(HTTP_STATUS_ERROR).json(errorMessage);
                });
        });

        this.router.delete('/delete/:idImage', (req: Request, res: Response, next: NextFunction) => {
            const idString = req.params.idImage as string;
            if (idString == undefined) return res.sendStatus(BAD_REQUEST);
            const id: ImageId = { imageId: idString };
            return this.drawService
                .deleteImageInDataBase(id as ImageId)
                .then((image: ImageDb) => {
                    if (image._id == undefined || image._id === '') {
                        return res.status(BAD_REQUEST).send('The image is not found');
                    }
                    if (image.fileExtension == undefined || image.fileExtension === '') {
                        return res.status(BAD_REQUEST).send('The image is not found');
                    }
                    this.drawService.deleteImageOnDisk(image._id, image.fileExtension).then(() => {
                        return res.status(HTTP_STATUS_DELETED).json({});
                    });
                    return true;
                })
                .catch((reason: unknown) => {
                    const errorMessage: Message = {
                        title: 'The image could not be deleted in the server',
                        body: reason as string,
                    };
                    return res.status(HTTP_STATUS_ERROR).json(errorMessage);
                });
        });

        this.router.get('/readAll', (req: Request, res: Response, next: NextFunction) => {
            if (!req.body) return res.sendStatus(BAD_REQUEST);
            return this.drawService
                .readAll()
                .then((listeImageDb: ImageDb[]) => {
                    return res.status(HTTP_STATUS_OK).json(listeImageDb);
                })
                .catch((reason: unknown) => {
                    const errorMessage: Message = {
                        title: 'Error',
                        body: reason as string,
                    };
                    return res.status(HTTP_STATUS_ERROR).json(errorMessage);
                });
        });
    }
}
