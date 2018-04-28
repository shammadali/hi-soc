import { Node } from "@backend/api";


export interface AttributeHierarchy {
    [attrType: string]: {
        children: string[],
        display: "default"
    };
}

export const attributeHierarchy: AttributeHierarchy = {
    education: {
        children: ["education-type", "education-degree"],
        display: "default"
    },
    work: {
        children: ["work-location", "work-position"],
        display: "default"
    },
    language: {
        children: ["languages-id", "locale-anonymized"],
        display: "default"
    },
    location: {
        children: ["location-id", "hometown-id"],
        display: "default"
    }
};

export const firstInARowAttrs = Object.keys(attributeHierarchy).reduce((hash, key) => {
    hash[key] = attributeHierarchy[key].children[0];

    return hash;
}, {});

export type AttrNames = keyof typeof attributeHierarchy;

export type AttrTreeHash = {
    [P in AttrNames]: AttributeDataNode[]
    };

export interface AttributeDataNode {
    attrName: string;
    value: string;
    nodes: Node[];
    percentage: number;
    children?: AttributeDataNode[];
}

export interface ArcMinimalData {
    startAngle: number;
    endAngle: number;
}

export interface ArcData extends ArcMinimalData {
    innerRadius: number;
    outerRadius: number;
    index: number;
    id: number;
    color: string;
    text: string;
    tooltip?: string;
    type: string;
    typeHash: string;
    nodes: Node[];
    isOutline?: boolean;
    filterable?: boolean;
    foldable?: boolean;
}


/**
 * Arcs generated for a single attribute data.
 */
export interface AttributeNodeArcs {
    node: AttributeDataNode;
    arcs: ArcData[];

    children?: AttributeNodeArcs[];
}
