import { AttributeMap, EgoNodeInfo, INodeService, Node, NodeContent, NodeRecord } from "./interfaces";
import { SqlDb } from "./SqlDb";


export interface GraphEdge {
    ID: number;
    Source: number;
    Target: number;
    Value: number;
}

export interface NodeCircle {
    node: number;
    circle: number;
}

export interface NodeAttribute {
    Node_ID: number;
    Ego_Node_ID: number;
    Attr_ID: number;
    Attr_Name: string;
    Attr_Type: string;
}

export class SqlNodeService implements INodeService {
    private db: SqlDb = new SqlDb();

    public all = (): Promise<EgoNodeInfo[]> =>
        this.db.query<{ id: number }>(`
            select
                n.Ego_Node_ID as id
            from
                Nodes as n
            group by
                n.Ego_Node_ID
            order by
                id`)
            .then(records =>
                records.map(r => ({
                        id: r.id,
                        title: `${r.id}`
                    }) as EgoNodeInfo
                )
            );

    public one(egoNodeId: number): Promise<NodeContent> {
        egoNodeId = parseInt(egoNodeId as any, 10);

        return Promise.all([
            this.nodes(egoNodeId),
            this.edges(egoNodeId),
            this.nodeAttributes(egoNodeId)
        ]).then(([nodes, edges, attrs]) =>
            ({
                nodes: nodes.map(n => {
                    const nodeAttrs = attrs.filter(a => a.Node_ID === n.Node_ID);

                    return {
                        id: n.Node_ID,
                        title: `${n.Node_ID} ${n.First_Name} ${n.Last_Name}`,
                        attributes: nodeAttrs.reduce<AttributeMap>((map, a) => {
                            const attrArray = a.Attr_Type.split(";");
                            const attrType = `${attrArray[0]}-${attrArray[1]}`;
                            const val = map[attrType] || [];
                            map[attrType] = val;

                            if (!val.includes(a.Attr_Name)) {
                                val.push(a.Attr_Name);
                            }

                            return map;
                        }, {})
                    } as Node;
                }),
                links: edges.map(e => ({
                    from: e.Source,
                    to: e.Target,
                    value: 1
                })).filter(l => nodes.some(n => n.Node_ID === l.from || n.Node_ID === l.to))
            }));
    }

    /**
     * Single node info
     */
    private nodes = (egoNodeId: number): Promise<NodeRecord[]> =>
        this.db.query<NodeRecord>(`
            select
                n.*
            from
                Nodes as n
            where
                n.Ego_Node_ID = @id`,
            { id: egoNodeId });


    private edges = (egoNodeId: number): Promise<GraphEdge[]> =>
        this.db.query<GraphEdge>(`
            with n as (
                select
                    *
                from
                    Nodes as nd
                where
                    nd.Ego_Node_ID = @id
            )
            select
                e.*
            from
                Graph_Edges as e
            where
                e.Source in (select n.Node_ID from n) and
                e.Target in (select n.Node_ID from n)`,
            { id: egoNodeId });


    private circles = (egoNodeId: number): Promise<NodeCircle[]> =>
        this.db.query<NodeCircle>(`
            select
                nc.Node_ID as node,
                max(nc.Circle_ID) as circle
            from
                Nodes as n inner join
                Nodes_Circles as nc on n.Node_ID = nc.Node_ID and n.Ego_Node_ID = nc.Ego_Node_ID
            where
                n.Ego_Node_ID = @id
            group by
                nc.Node_ID`,
            { id: egoNodeId });


    private nodeAttributes = (egoNodeId: number): Promise<NodeAttribute[]> =>
        this.db.query<NodeAttribute>(`
            select
                na.Node_ID,
                na.Ego_Node_ID,
                na.Attr_ID,
                a.Attr_Name,
                a.Attr_Type
            from
                Node_Attr as na inner join
                Attributes as a on na.Attr_ID = a.ID
            where
                na.Ego_Node_ID = @egoNodeId`,
            { egoNodeId })
            .then(result => result.map(r => ({ ...r })));

}