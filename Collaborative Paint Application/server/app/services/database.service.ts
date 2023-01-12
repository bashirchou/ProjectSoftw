import {Db, MongoClient} from 'mongodb';
import 'reflect-metadata';
import {Service} from 'typedi';
import {environment} from '@app/environnements/environnement';
import {Discussion} from '@app/classes/Discussion';
import {User} from '@app/classes/User';
import {Album} from '@app/classes/Album';
import {MongoUniqueID} from '@app/classes/mongo-unique-id';
import {Drawing} from '@app/classes/Drawing';
import {AlbumService} from './albumService/album.service';
import {UserService} from './userService/user.service';
import {DiscussionService} from './discussionService/discussion.service';

/*
 * CHANGE the URL for your database information
 * const DATABASE_URL = 'mongodb+srv://equipe104:Teamprojet2@cluster0.2bthm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
 */
const DATABASE_URL = environment.mongoUrl;
const DATABASE_NAME = 'database';
const ALBUMS = 'Albums';
const PROFILES = 'Pofils';
const DISCUSSION = 'DISCUSSION';
const UNIQUEID = 'UNIQUEID';
// const EXPOSITION = 'EXPOSITION';

@Service()
export class DatabaseService {
    // Public for testing both
    client: MongoClient;

    db: Db;
    constructor (private albumService: AlbumService, private userService: UserService, private discussionService: DiscussionService) {}

    async start (url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err.message);
            throw new Error('Database connection error');
        }
        // await this.db.collection(UNIQUEID).deleteMany({});
        if ((await this.db.collection(UNIQUEID).countDocuments()) === 0) {
            await this.populateUniqueId();
        }

        // await this.db.collection(ALBUMS).deleteMany({});
        if ((await this.db.collection(ALBUMS).countDocuments()) === 0) {
            await this.populateAlbums();
        }

        // await this.db.collection(PROFILES).deleteMany({});
        if ((await this.db.collection(PROFILES).countDocuments()) === 0) {
            await this.populateProfils();
        }

        // await this.db.collection(DISCUSSION).deleteMany({});
        if ((await this.db.collection(DISCUSSION).countDocuments()) === 0) {
            await this.populateDiscussion();
        }
        // await this.db.collection(EXPOSITION).deleteMany({});
        return this.client;
    }

    async closeConnection (): Promise<void> {
        return this.client.close();
    }

    async populateUniqueId (): Promise<void> {
        const nextId = {'nextAlbumId': 1,
            'nextDrawingId': 0,
            'nextDiscussionId': 1};// Discussion id is a num just to increment it easily, need to be converted to string
        // eslint-disable-next-line no-console
        console.log('THIS ADDS DATA TO UNIQUEID OF THE DATABASE, DO NOT USE OTHERWISE');
        await this.db.collection(UNIQUEID).insertOne(nextId);
    }

    async populateProfils (): Promise<void> {
        // Modifie pour mettre les profils
        const profils = [this.userService.userCreator('tony@gmail.com', 'antho', 'mdp', 0, 'socket', true)];
        // eslint-disable-next-line no-console
        console.log('THIS ADDS DATA TO PROFILES OF THE DATABASE, DO NOT USE OTHERWISE');
        for (const profil of profils) {
            await this.db.collection(PROFILES).insertOne(profil);
        }
    }

    async populateAlbums (): Promise<void> {
        // Modifie pour mettre les dessins de l'album
        const albums = [this.albumService.albumCreater(0, 'PublicAlbum', 'anthony@gmail.com')];
        // eslint-disable-next-line no-console
        console.log('THIS ADDS DATA TO ALBUMS OF THE DATABASE, DO NOT USE OTHERWISE');
        for (const album of albums) {
            await this.db.collection(ALBUMS).insertOne(album);
        }
    }


    async populateDiscussion (): Promise<void> {
        // Modifie pour mettre les DISCUSSION
        const discussions = [this.discussionService.discussionCreator(0, 'messageRoom0')];
        // eslint-disable-next-line no-console
        console.log('THIS ADDS DATA TO DISCUSSION OF THE DATABASE, DO NOT USE OTHERWISE');
        for (const discussion of discussions) {
            await this.db.collection(DISCUSSION).insertOne(discussion);
        }
    }

    async getAllProfiles () {
        const profiles: User[] = [];
        await this.db.
            collection(PROFILES).
            find<User>({}).
            forEach((document) => {
                profiles.push(document);
            });
        return profiles;
    }

    async getAllAlbums () {
        const albums: Album[] = [];
        await this.db.
            collection(ALBUMS).
            find<Album>({}).
            forEach((album) => {
                albums.push(album);
            });
        return albums;
    }

    async getAlbum (uniqueId: number) {
        const album = await this.db.
            collection(ALBUMS).
            findOne<Album>({'id': uniqueId}) as Album;

        return album;
    }

    async getAllDiscussions () {
        const discussions: Discussion[] = [];
        await this.db.
            collection(DISCUSSION).
            find<Discussion>({}).
            forEach((document) => {
                discussions.push(document);
            });
        return discussions;
    }


    async getNextAlbumId () {
        const idMongo = ((await this.db.collection(UNIQUEID).findOne({})) as MongoUniqueID);
        const newId = idMongo.nextAlbumId;
        idMongo.nextAlbumId += 1;
        ((await this.db.collection(UNIQUEID).replaceOne({}, idMongo)) as MongoUniqueID);
        return newId;
    }

    async getNextDrawingId () {
        const idMongo = ((await this.db.collection(UNIQUEID).findOne({})) as MongoUniqueID);
        const newId = idMongo.nextDrawingId;
        idMongo.nextDrawingId += 1;
        ((await this.db.collection(UNIQUEID).replaceOne({}, idMongo)) as MongoUniqueID);
        return newId;
    }

    async getNextDiscussionId () {
        const idMongo = ((await this.db.collection(UNIQUEID).findOne({})) as MongoUniqueID);
        const newId = idMongo.nextDiscussionId;
        idMongo.nextDiscussionId += 1;
        ((await this.db.collection(UNIQUEID).replaceOne({}, idMongo)) as MongoUniqueID);
        return newId;
    }

    async addProfile (profile: User) {
        await this.db.collection(PROFILES).insertOne(profile);
    }
    async updateProfile (profile: User) {
        return await this.db.collection(PROFILES).replaceOne({email: profile.email}, profile);
    }

    async addAlbum (album: Album) {
        return await this.db.collection(ALBUMS).insertOne(album);
    }
    async addUserRequestJoinAlbum (idAlbum: number, mail: string) {
        const album = await this.db.collection(ALBUMS).findOne<Album>({id: idAlbum});
        if (album === undefined) {
            throw Error('Cannot add request to unexisting album..');
        }
        album?.userRequestJoin.push(mail);
        return await this.db.collection(ALBUMS).replaceOne({id: idAlbum}, album as Album);
    }

    async addDiscussion (discussion: Discussion) {
        return await this.db.collection(DISCUSSION).insertOne(discussion);
    }
    async deleteAlbum (id: number) {
        return await this.db.collection(ALBUMS).deleteOne({'id': id});
    }
    async deleteDiscussion (id: number) {
        return await this.db.collection(DISCUSSION).deleteOne({'id': id});
    }
    async updateOrAddDrawing (albumId: number, drawing: Drawing) {
        const album = await this.getAlbum(albumId) as Album;
        album.drawings.set(drawing.id, drawing);
        return await this.db.collection(ALBUMS).replaceOne({id: album.id}, album);
    }
    async updateAlbum (album: Album) {
        return await this.db.collection(ALBUMS).replaceOne({id: album.id}, album);
    }
    async updateDiscussion (discussion: Discussion) {
        return await this.db.collection(DISCUSSION).replaceOne({id: discussion.id}, discussion);
    }
}
