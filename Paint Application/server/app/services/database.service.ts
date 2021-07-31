import { Image, ImageDb, ImageId } from '@common/communication/image';
import { injectable } from 'inversify';
import { Db, MongoClient, MongoClientOptions, ObjectID } from 'mongodb';
import 'reflect-metadata';

// CHANGE the URL for your database information
// TODO: Add passwords and email to db into a env variable. Use dotenv for example.
const DATABASE_URL = 'mongodb+srv://Admin:admin123@cluster0.nxj2a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = 'Log2990-Database';
const DATABASE_COLLECTION = 'Collection1';

@injectable()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url, this.options);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }
        return this.client;
    }

    async writeInDatase(image: Image): Promise<ImageDb> {
        const dataToWriteInServerDisk = image.data;
        const headerAndData = image.data.split(',');
        const dataTypeAndEncoding = headerAndData[0].split(';');
        const fileFormatToWrite = dataTypeAndEncoding[0].split(':')[1];
        const extension = fileFormatToWrite.split('/')[1];
        image.data = '';
        const dataToInsert = {
            title: image.title,
            tags: image.tags,
            data: image.data,
            fileExtension: extension,
        };
        await this.db.collection(DATABASE_COLLECTION).insertOne(dataToInsert);
        const imageDb = (dataToInsert as unknown) as ImageDb;
        imageDb.data = dataToWriteInServerDisk;
        return imageDb;
    }

    async deleteInDataBase(id: ImageId): Promise<ImageDb> {
        const idImage: ObjectID = new ObjectID(id.imageId);

        const imageDb = await this.db
            .collection(DATABASE_COLLECTION)
            .findOne({ _id: idImage })
            .then((token) => {
                return token;
            });

        await this.db.collection(DATABASE_COLLECTION).deleteOne({ _id: idImage });

        return (imageDb as unknown) as ImageDb;
    }

    async getAllImageDataBase(): Promise<ImageDb[]> {
        const imageDb = await this.db
            .collection(DATABASE_COLLECTION)
            .find({})
            .toArray()
            .then((token) => {
                return token;
            });
        return (await (imageDb as unknown)) as ImageDb[];
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    get database(): Db {
        return this.db;
    }
}
