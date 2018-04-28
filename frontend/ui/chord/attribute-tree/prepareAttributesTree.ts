import { Node } from "@backend/api";

import { AttributeDataNode, attributeHierarchy, AttrTreeHash } from "./interfaces";

export function buildTree(nodes: Node[]): AttrTreeHash {
    return Object.keys(attributeHierarchy).reduce((accumulator, name) => {
        accumulator[name] = buildAttrTree(nodes, attributeHierarchy[name].children);
        return accumulator;
    }, {} as AttrTreeHash);
}


function buildAttrTree(nodes: Node[], attrNames: string[], index: number = 0): AttributeDataNode[] {
    if (index === attrNames.length) {
        return null;
    }

    const attrType = attrNames[index];
    const level = buildOneLevel(nodes, attrType);

    level.forEach(attrNode => {
        attrNode.children = buildAttrTree(attrNode.nodes, attrNames, index + 1);
    });

    return level;
}

type AttributeValues = {
    [value: string]: {
        count: number;
        nodes: Node[];
    }
};

function buildOneLevel(source: Node[], attr: string): AttributeDataNode[] {
    const attributeValues: AttributeValues = {};
    let totalValues = 0;

    for (const node of source) {
        const values = node.attributes[attr];

        if (!values) {
            continue;
        }

        for (const value of values) {
            const info = (attributeValues[value] = attributeValues[value] || { count: 0, nodes: [] });
            info.count++;
            totalValues++;
            info.nodes.pushDistinct(node);
        }
    }

    return Object.keys(attributeValues).map((attrValue, index) => ({
        attrName: attr,
        value: attrValue,
        nodes: attributeValues[attrValue].nodes,
        percentage: totalValues ? attributeValues[attrValue].count / totalValues : 0
    }));
}