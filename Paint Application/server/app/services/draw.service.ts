import { TYPES } from '@app/types';
import { Image, ImageDb, ImageId } from '@common/communication/image';
import { access, existsSync, mkdir, readdir, readFile, unlink, writeFile } from 'fs';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as util from 'util';
import { DatabaseService } from './database.service';

@injectable()
export class DrawService {
    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}
    dataPath: string = 'data/';

    async writeImageDataDisk(image: ImageDb): Promise<void> {
        const headerAndData = image.data.split(',');
        const dataTypeAndEncoding = headerAndData[0].split(';');
        const fileFormatToWrite = dataTypeAndEncoding[0].split(':')[1];
        const fileExtension = fileFormatToWrite.split('/')[1];

        const filename = this.dataPath + image._id + '.' + fileExtension;
        const encodingFormat = dataTypeAndEncoding[1];
        const dataWithEncoding = image.data.replace(headerAndData[0] + ',', ''); // remove Header
        const write = util.promisify(writeFile);
        const checkFileExist = util.promisify(access);
        const makeDirectory = util.promisify(mkdir);
        try {
            await checkFileExist(this.dataPath);
        } catch (error) {
            await makeDirectory(this.dataPath, { recursive: true });
        }
        return await write(filename, dataWithEncoding, encodingFormat);
    }

    async writeImageInDataBase(image: Image): Promise<ImageDb> {
        return await this.databaseService.writeInDatase(image);
    }

    async getAllImageDataBase(): Promise<ImageDb[]> {
        return await this.databaseService.getAllImageDataBase();
    }

    async deleteImageInDataBase(id: ImageId): Promise<ImageDb> {
        return await this.databaseService.deleteInDataBase(id);
    }

    fileExist(path: string): boolean {
        return existsSync(path);
    }

    async deleteImageOnDisk(id: string, fileExtension: string): Promise<void> {
        const listImageTitleExtension = await this.getAllImageTitleAndFileExtension();
        const fullName = id + '.' + fileExtension;
        for (const imageName of listImageTitleExtension) {
            if (fullName === imageName) {
                unlink(this.dataPath + fullName, (err: Error) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
    }

    async getAllImageTitleAndFileExtension(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            readdir(this.dataPath, (err: Error, files: string[] | PromiseLike<string[]>) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

    async readAll(): Promise<ImageDb[]> {
        const listeImageDb = await this.getAllImageDataBase();
        const listeImageDbAndServer: ImageDb[] = [];

        const listeTitleExtension = await this.getAllImageTitleAndFileExtension();
        const read = util.promisify(readFile);
        let imageInServer = false;
        for (const image of listeImageDb) {
            listeTitleExtension.forEach((value) => {
                if (value === image._id + '.' + image.fileExtension) {
                    imageInServer = true;
                }
            });
            if (imageInServer) {
                const data = await read(this.dataPath + image._id + '.' + image.fileExtension, { encoding: 'base64' });
                image.data = 'data:image/' + image.fileExtension + ';base64,' + data;
                listeImageDbAndServer[listeImageDbAndServer.length] = image;
            }
            imageInServer = false;
        }
        return listeImageDbAndServer;
    }
}
