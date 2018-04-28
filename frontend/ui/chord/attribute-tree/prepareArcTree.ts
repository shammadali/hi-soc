import { scaleOrdinal } from "d3";
import { Map } from "immutable";

import { Node } from "@backend/api";

import { firstArcThickness, initialChordSize } from "../constants";

import { ArcData, AttributeNodeArcs, AttrTreeHash } from "./interfaces";
import { ArcBounds, nextId, overlappingLayout } from "./arcLayouts";
import { buildTree } from "./prepareAttributesTree";
import { ColorInterpolator } from "./coloring";

const colorScale = scaleOrdinal()
    .range(["#305BC3", "#A617A1", "#73A956", "#F25025"]);

function attrTypeColor(attr: string): string {
    return colorScale(attr).toString();
}

function convertAttributeTypeToValue(attr: string): string {
    const hash = {
        "education-type": "Education",
        "work-location": "Work",
        "languages-id": "Languages",
        "location-id": "Location"
    };

    return hash[attr] || attr;
}

export function prepareArcTree(nodes: Node[],
                               toggledArcs: Map<string, ArcData> = Map({}) as Map<string, ArcData>,
                               foldingMode: boolean = false): AttributeNodeArcs[] {

    const attrTree: AttrTreeHash = buildTree(nodes);

    const attributes = Object.keys(attrTree);
    const size = initialChordSize / 2;

    let startAngle = 0;
    const totalAttributeCount = Object.keys(attrTree).reduce((total, name) => total + attrTree[name].length, 0);

    return attributes.map((attrType, index) => {
        const attrNodes = attrTree[attrType];
        const nodes = attrNodes.flatten(n => n.nodes).distinct(n => n.id);
        const percentage = attrTree[attrType].length / totalAttributeCount;
        const endAngle = startAngle + 2 * Math.PI * percentage;
        const color = attrTypeColor(attrType);

        const arcTree: ArcData = {
            startAngle,
            endAngle,
            index,
            color,
            nodes,
            innerRadius: size,
            outerRadius: size + firstArcThickness,
            id: nextId(),
            text: `${attrType.replace(/[a-z]/, x => x.toUpperCase())} (${(percentage * 100).toFixed(2)}%) `,
            type: "attribute-type",
            tooltip: [
                `Angles from ${startAngle.toFixed(2)} to ${endAngle.toFixed(2)} (${(endAngle - startAngle).toFixed(2)})`,
                `Type hash: ${convertAttributeTypeToValue(attrNodes[0].attrName)}`,
                `Associated nodes: ${nodes.length} \r\n(${
                    nodes.map((node, index) =>
                        (index + 1) % 4 === 0
                            ? `${node.id},\r\n`
                            : (index + 1) !== nodes.length
                            ? `${node.id}, `
                            : `${node.id}`
                    ).join("")
                    })`
            ].join("\r\n"),
            typeHash: convertAttributeTypeToValue(attrNodes[0].attrName),
            filterable: true,
            foldable: true
        };

        startAngle = endAngle;

        const result: AttributeNodeArcs = {
            node: {
                attrName: "attribute-type",
                children: [],
                nodes: arcTree.nodes,
                percentage,
                value: ""
            },
            arcs: [arcTree]
        };

        const bounds: ArcBounds = {
            startAngle: arcTree.startAngle,
            endAngle: arcTree.endAngle
        };

        result.children = overlappingLayout(attrTree[attrType], result, new ColorInterpolator(color), bounds, toggledArcs, foldingMode);

        const children = (result.children || []);
        const typeHash = arcTree.typeHash;
        const nextRadius = children.flatten(c => c.arcs).concat(children.flattenRec(c => c.children)
                .flatten(u => u.arcs))
                .max(a => a.outerRadius, size) + 8;

        if (result.children) {
            const dashedArcInnerRadius = arcTree.outerRadius + 2;
            const dashedArcouterRadius = !foldingMode || toggledArcs.has(typeHash) ? nextRadius - 5 : dashedArcInnerRadius;
            const outlineArc: ArcData = {
                startAngle: bounds.startAngle,
                endAngle: bounds.endAngle,
                innerRadius: dashedArcInnerRadius,
                outerRadius: dashedArcouterRadius,
                index,
                id: nextId(),
                color: arcTree.color,
                text: arcTree.text,
                tooltip: `${arcTree.type.replace(/^[a-z]|-|id|anonymized/g, match =>
                    match === "-" ||
                    match === "id" ||
                    match === "anonymized" ? " " : match.toUpperCase()
                )} :: ${arcTree.text}\r\nNode count: ${arcTree.nodes.length}`,
                type: arcTree.type,
                typeHash,
                nodes: arcTree.nodes,
                isOutline: true,
                filterable: false,
                foldable: false
            };

            result.arcs.unshift(outlineArc);
        }

        return result;
    });
}
