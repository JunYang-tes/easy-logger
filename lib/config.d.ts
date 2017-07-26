import { ILogger, ICfg } from "./types";
export declare function configure(cfg?: ICfg): {
    logger: ILogger;
    cfg: ICfg;
};
