import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Image, ImgurDataPost } from '@app/classes/constant';
import { ImageDb, ImageId } from '@common/communication/image';
import { Message } from '@common/communication/message';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ServerCommunicationService {
    private readonly IMGUR_UPLOAD_URL: string = 'https://api.imgur.com/3/image';
    private readonly clientId: string = 'c11e1c70bdfe340';

    private writeImageUrl: string = environment.baseUrl + '/api/draw/write';
    private getAllImageWithDataServerUrl: string = environment.baseUrl + '/api/draw/readAll';
    private deleteImageDatabaseServerUrl: string = environment.baseUrl + '/api/draw/delete';

    constructor(private http: HttpClient) {}

    getObserverFromServerWritingImage(image: Image): Observable<Message> {
        return this.http.post<Message>(this.writeImageUrl, image);
    }

    getObserverFromServerGetAllImageWithData(): Observable<ImageDb[]> {
        return this.http.get<ImageDb[]>(this.getAllImageWithDataServerUrl);
    }
    deleteObserverFromServerDeleteDatabaseAndServer(id: ImageId): Observable<Message> {
        return this.http.delete<Message>(this.deleteImageDatabaseServerUrl + '/' + id);
    }

    getObserverFromServerWritingImageImgur(b64Image: string): Observable<ImgurDataPost> {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: 'Client-ID ' + this.clientId,
            }),
        };
        const formData = new FormData();
        formData.append('image', b64Image);
        return this.http.post<ImgurDataPost>(this.IMGUR_UPLOAD_URL, formData, httpOptions);
    }
}
