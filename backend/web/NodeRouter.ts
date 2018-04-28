import { Router } from "express";

import { INodeService, SqlNodeService } from "../business";

export const nodeRouter = Router();

function svc(): INodeService {
    // return new FileSysNodeService();
    return new SqlNodeService();
}

nodeRouter.get("/:id", (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.sendStatus(404);
    }

    const service = svc();

    service.one(id)
        .then(
            node => {
                if (!node) {
                    res.sendStatus(404);
                } else {
                    res.json(node);
                }
            },
            err => {
                console.error(`The error occured on processing request ${req.method} ${req.path}`);
                console.error(err);

                res.sendStatus(500);
            }
        );
});

nodeRouter.get("/", (req, res) => {
    svc().all()
        .then(
            nodes => {
                res.json(nodes);
            },
            err => {
                console.error(`The error occured on processing request ${req.method} ${req.path}`);
                console.error(err);

                res.sendStatus(500);
            }
        );
});