import { LoggerFn } from "./types";
export interface ILoggerCreator {
    (name: string): {
        debug: LoggerFn;
        info: LoggerFn;
        error: LoggerFn;
        warn: LoggerFn;
    };
    logger: ILoggerCreator;
}
export declare const logger: ILoggerCreator;
