/** Short node information */
export interface EgoNodeInfo {
    /** Node ID */
    id: string | number;
    /** Node title */
    title: string;
}

export type AttributeValue = string;

export interface AttributeMap {
    [attrType: string]: AttributeValue[];
}

export interface Node {
    id: number;
    title: string;
    attributes: AttributeMap;
}

export interface Link {
    value: number;
    from: number;
    to: number;
}

/**
 * Node content prepared for chord diagram
 */
export interface NodeContent {
    links: Link[];
    nodes: Node[];
}

export interface NodeRecord {
    Node_ID: number;
    Ego_Node_ID: number;
    DOB: string;
    First_Name: string;
    Last_Name: string;
    M_Name: string;
    Home_Town: string;
    gender: string;
}

export interface INodeService {
    all(): Promise<EgoNodeInfo[]>;
    one(nodeId: number): Promise<NodeContent | null>;
}