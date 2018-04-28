import * as sql from "mssql";

import config from "../config";

export class SqlDb {

    public query = <TRecord>(sqlText: string, parameters: { [name: string]: any } = null): Promise<TRecord[]> =>
        this.connect()
            .then(connection => {
                const request = new sql.Request(connection);

                if (parameters) {
                    Object.keys(parameters)
                        .forEach(name => request.input(name, parameters[name]));
                }

                return request.query<TRecord>(sqlText);
            });

    private connect = (): Promise<sql.Connection> =>
        config().then(settings =>
            new Promise<sql.Connection>((resolve, reject) => {
                const connection = new sql.Connection(
                    <any>settings.sqlServer,
                    err => err
                        ? reject(err)
                        : resolve(connection)
                );
            })
        );
}