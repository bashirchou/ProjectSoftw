import {HttpException} from '@app/classes/http.exception';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import {StatusCodes} from 'http-status-codes';
import logger from 'morgan';
import {Service} from 'typedi';

@Service()
export class Application {

    app: express.Application;

    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;

    constructor () {

        this.app = express();


        this.config();

        this.errorHandling();

    }

    private config (): void {

        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({'extended': true}));
        this.app.use(cookieParser());
        this.app.use(cors());

    }

    private errorHandling (): void {

        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {

            const err: HttpException = new HttpException('Not Found');
            next(err);

        });

        /*
         * Development error handler
         * will print stacktrace
         */
        if (this.app.get('env') === 'development') {

            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {

                res.status(err.status || this.internalError);
                res.send({
                    'error': err,
                    'message': err.message
                });

            });

        }

        /*
         * Production error handler
         * no stacktraces leaked to user (in production env only)
         */
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {

            res.status(err.status || this.internalError);
            res.send({
                'error': {},
                'message': err.message
            });

        });

    }

}