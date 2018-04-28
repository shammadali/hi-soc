import * as fs from "fs";
import * as path from "path";

import config from "../config";

import { EgoNodeInfo, INodeService, NodeContent } from "./interfaces";

export class FileSysNodeService implements INodeService {

    /** Read a list of all available nodes. */
    public all = (): Promise<EgoNodeInfo[]> =>
        config().then(settings =>
            new Promise<EgoNodeInfo[]>((resolve, reject) => {
                fs.readdir(settings.jsonDataDir, (err, files) => {
                    if (err) {
                        return reject(err);
                    }

                    const nodes = files.map(file => path.parse(file))
                        .map(fi =>
                            ({
                                id: fi.base,
                                title: fi.name
                            }) as EgoNodeInfo
                        );

                    resolve(nodes);
                });
            })
        )


    public one(id: number): Promise<NodeContent | null> {
        if (!id) {
            throw new Error("ID is not defined.");
        }

        return config().then(settings =>
            new Promise<NodeContent | null>((resolve, reject) => {
                const fullPath = path.join(settings.jsonDataDir, id);

                fs.readFile(fullPath, "utf8", (err, content) => {
                    if (err) {
                        if (err.code === "ENOENT") {
                            return resolve(null);
                        }

                        return reject(err);
                    }

                    const node = JSON.parse(content);

                    resolve(node);
                });
            })
        );
    }
}