import * as fs from "fs";
import * as path from "path";

import { config } from "mssql";


export interface ISettings {
    sqlServer: config | string;
    jsonDataDir: string;
}

export default function (): Promise<ISettings> {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "config.json"), "utf8", (err, data) => {
            if (err) {
                return reject(err);
            }

            const settings: ISettings = JSON.parse(data);

            resolve({ ...settings, jsonDataDir: path.resolve(path.join(__dirname, settings.jsonDataDir)) });
        });
    });
};