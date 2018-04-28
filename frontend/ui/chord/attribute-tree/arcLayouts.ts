// import * as color from "color";
// import { rgb } from "d3";
import { Map } from "immutable";

import { Node } from "@backend/api";

import { arcThickness } from "../constants";

import { ArcData, ArcMinimalData, AttributeDataNode, AttributeNodeArcs } from "./interfaces";
import { ColorInterpolator } from "./coloring";


export interface ArcBounds {
    startAngle: number;
    endAngle: number;
}

let counter = 0;
export function nextId(): number {
    return counter++;
}

/*
 export function sunburstLayout(nodes: AttributeDataNode[], parentNode: AttributeNodeArcs): AttributeNodeArcs[] {
 const startAngle = parentNode.arcs.min(a => a.startAngle);
 const endAngle = parentNode.arcs.max(a => a.endAngle);
 const outerRadius = parentNode.arcs.max(a => a.outerRadius);

 let stepAngle = 0;

 return nodes.map((node: AttributeDataNode, index) => {

 const nodeAngle = (endAngle - startAngle) * node.percentage;
 const multiplyer = nextId() - parentNode.arcs[0].id;
 const parentColor = rgb(color(parentNode.arcs[0].color).mix(color(parentNode.arcs[0].color).rotate(multiplyer * 1.3), multiplyer / nextId() * 2.5).rgbString()).toString();

 const arcTree: ArcData = {
 startAngle: startAngle + stepAngle,
 endAngle: startAngle + (stepAngle + nodeAngle),
 outerRadius: outerRadius + arcThickness,
 innerRadius: outerRadius,
 index: index,
 id: nextId(),
 color: parentColor,
 text: node.value,
 type: node.attrName,
 typeHash: `${parentNode.arcs[0].typeHash}:${node.value}`,
 nodes: node.nodes
 };

 stepAngle += nodeAngle;

 return {
 node,
 arcs: [arcTree]
 };
 });
 }
 */

/*
 export function barLayout(nodes: AttributeDataNode[], parentNode: AttributeNodeArcs): AttributeNodeArcs[] {
 nodes.sort((first, second) => second.percentage - first.percentage);

 const startAngle = parentNode.arcs.min(a => a.startAngle);
 const endAngle = parentNode.arcs.max(a => a.endAngle);
 const outerRadius = parentNode.arcs.max(a => a.outerRadius);
 const parentColor = rgb(parentNode.arcs[0].color);

 return nodes.map((node: AttributeDataNode, index) => {

 const nodeAngle = (endAngle - startAngle) * node.percentage;
 const offsetWidth = arcThickness * index;

 const arc = {
 startAngle: startAngle,
 endAngle: startAngle + nodeAngle,
 outerRadius: outerRadius + arcThickness + offsetWidth,
 innerRadius: outerRadius + offsetWidth,
 index: index,
 id: nextId(),
 color: parentColor.brighter((index + 1) / 3).toString(),
 text: node.value,
 type: node.attrName,
 typeHash: `${parentNode.arcs[0].typeHash}:${node.value}`,
 nodes: node.nodes
 };

 return {
 node,
 arcs: [arc]
 };
 });
 }
 */

/**
 * Draw arcs as one layer per attribute. Arcs can not overlap.
 */
/*export function layeredLayout(nodes: AttributeDataNode[], parentNode: AttributeNodeArcs, color: ColorInterpolator): AttributeNodeArcs[] {

 let innerRadius = (offset ? offset : parentNode.arcs[0].outerRadius) + 5;
 offset = null;

 const startAngle = parentNode.arcs.min(a => a.startAngle);
 const endAngle = parentNode.arcs.max(a => a.endAngle);

 let currentStartAngle = startAngle;

 const parentTypeHash = parentNode.arcs[0].typeHash;

 return nodes.map((node, index) => {
 const angle = (endAngle - startAngle) * node.percentage;

 const a: ArcData = {
 startAngle: currentStartAngle,
 endAngle: currentStartAngle + angle,
 innerRadius: innerRadius,
 outerRadius: innerRadius + arcThickness,
 index,
 id: nextId(),
 color: color.shade(index),
 text: `${node.value} (${(node.percentage * 100).toFixed(2)}%)`,
 type: node.attrName,
 tooltip: [
 `${node.attrName} => ${node.value}`,
 `Total nodes: ${node.nodes.length}`
 ].join("\r\n"),
 typeHash: `${parentTypeHash}:${node.value}`,
 nodes: node.nodes
 };

 innerRadius += arcThickness;
 currentStartAngle += angle;

 const arcNode: AttributeNodeArcs = {
 node,
 arcs: [a]
 };

 arcNode.children = (node.children && node.children.length) ? attrNodeToArcTree(node.children, arcNode, color.levelUp()) : null;

 return arcNode;
 });
 }*/

/**
 * Draw arcs as one layer per attribute.
 * Arcs can overlap (and possible have a gapes) to indicate attribute value overlapping.
 */
export function overlappingLayout(attrNodes: AttributeDataNode[],
    parentNode: AttributeNodeArcs,
    color: ColorInterpolator,
    bounds: ArcBounds,
    toggledArcs: Map<string, ArcData>,
    foldingMode: boolean): AttributeNodeArcs[] {
    /**
     * Draws overlapping layout with gaps as a set of layered arcs
     * Each attribute value has a set of arcs on each own level.
     * Total angle of the arcs on the level matches a percentage of attribute value.
     * Layout for the level consists of few parts: independent part, previous overlapping part, other overlapping parts.
     */

    let innerRadius = parentNode.arcs.max(a => a.outerRadius, 0) + 3;
    const parentTypeHash = parentNode.arcs[0].typeHash;

    if (foldingMode && !toggledArcs.get(parentTypeHash)) {
        return null;
    }

    return overlapCore(attrNodes, parentNode.node.nodes, bounds).map<AttributeNodeArcs>((data, index) => {

        const node = data.attrNode;
        const typeHash = `${parentTypeHash}:${node.value}`;

        const result: AttributeNodeArcs = {
            node,
            arcs: data.arcs.map(arc => ({
                startAngle: arc.startAngle,
                endAngle: arc.endAngle,
                innerRadius: innerRadius + 3,
                outerRadius: innerRadius + arcThickness,
                index,
                id: nextId(),
                color: color.at(index),
                text: `${node.value}`,
                type: node.attrName,
                typeHash,
                tooltip: [
                    `${node.attrName} => ${node.value}`,
                    `Type hash: ${parentTypeHash}:${node.value}`,
                    `Associated nodes: ${data.attrNode.nodes.length} \r\n(${
                    data.attrNode.nodes.map((node, index) =>
                        (index + 1) === data.attrNode.nodes.length
                            ? `${node.id}`
                            : (index + 1) % 4 === 0
                                ? `${node.id},\r\n`
                                : `${node.id}, `
                    ).join("")
                    })`
                ].join("\r\n"),
                nodes: data.attrNode.nodes,
                foldable: !!(node.children && node.children.length),
                filterable: true
            }))
        };

        const childBounds: ArcBounds = {
            startAngle: data.arcs.min(a => a.startAngle),
            endAngle: data.arcs.max(a => a.endAngle)
        };

        result.children = (node.children && node.children.length) ? overlappingLayout(node.children, result, color.levelUp(), childBounds, toggledArcs, foldingMode) : null;

        const children = (result.children || []);
        const nextRadius = children.flatten(c => c.arcs).concat(children.flattenRec(c => c.children)
            .flatten(u => u.arcs))
            .max(a => a.outerRadius, innerRadius) + 8;

        if (result.children) {
            const dashedArcInnerRadius = innerRadius + arcThickness + 2;
            const dashedArcOuterRadius = toggledArcs.size === 0 || toggledArcs.has(typeHash) ? nextRadius - 5 : dashedArcInnerRadius;
            const outlineArc: ArcData = {
                startAngle: childBounds.startAngle,
                endAngle: childBounds.endAngle,
                innerRadius: dashedArcInnerRadius,
                outerRadius: dashedArcOuterRadius,
                index,
                id: nextId(),
                color: result.arcs[0].color,
                text: `${node.value}`,
                type: node.attrName,
                typeHash,
                nodes: data.attrNode.nodes,
                isOutline: true,
                filterable: false,
                foldable: false
            };

            result.arcs.unshift(outlineArc);
        }

        innerRadius = toggledArcs.size === 0 || toggledArcs.has(typeHash) ? nextRadius : innerRadius + arcThickness;

        return result;
    });
}

interface OverlappingArcs {
    arcs: (ArcMinimalData & { debugInfo?: string })[];
    attrNode: AttributeDataNode;
}

function overlapCore(attrNodes: AttributeDataNode[], nodes: Node[], bounds: ArcBounds): OverlappingArcs[] {
    /**
     * Total nodes - total number of nodes at parent attribute node
     * Attr value weight - number of nodes which have attr with the value
     * Overlapping weight - number of nodes have attr value and prev attr value
     * 'Independent' value (which indicates arc part outdents previous arc) - number of nodes has attr value but not value of any of prev attributes*
     */

    const startAngle = bounds.startAngle;
    const endAngle = bounds.endAngle;
    const parentAngle = endAngle - startAngle;

    const attribute = attrNodes[0].attrName;
    const nodeAttrValues = nodes.map(n => n.attributes[attribute] || []);

    let cw = true;

    return attrNodes.mapLookBehind<OverlappingArcs>((attrNode, prev, index, arr, currentResult) => {
        // Nodes
        const nodesWithAttr = nodeAttrValues.filter(v => v.includes(attrNode.value));

        const prevOverlappingNodes = nodeAttrValues.filter(a => prev && a.includes(attrNode.value) && a.includes(prev.attrNode.value));

        const independentNodes = nodeAttrValues.filter(a => a.includes(attrNode.value) && !currentResult.some(p => a.includes(p.attrNode.value)));

        const overlappingOtherValueNodes = currentResult.map(a => {
            const overlappingNodes = nodeAttrValues.filter(av => av.includes(attrNode.value) && av.includes(a.attrNode.value));

            return {
                overlapsWith: a.attrNode,
                overlappingCount: overlappingNodes.length,
                mainArc: a.arcs[0]
            };
        }).filter(a => a.overlappingCount)
            .reverse();

        // Percents
        const percent = nodesWithAttr.length / nodes.length;
        const prevOverlappingPercent = prevOverlappingNodes.length / nodes.length;

        // Angles
        const arcAngle = parentAngle * percent;
        const prevOverlappingAngle = parentAngle * prevOverlappingPercent;

        const prevLevelStartAngle = prev ? prev.arcs[0].startAngle : startAngle;
        const prevLevelEndAngle = prev ? prev.arcs[0].endAngle : startAngle;

        const cwAngles = (() => {
            const sa = prevLevelEndAngle - prevOverlappingAngle;
            const ea = sa + arcAngle;

            return [sa, ea, true] as [number, number, boolean];
        })();

        const ccwAngles = (() => {
            const ea = prevLevelStartAngle + prevOverlappingAngle;
            const sa = ea - arcAngle;

            return [sa, ea, false] as [number, number, boolean];
        })();

        let [arcStartAngle, arcEndAngle] = [0, 0];

        const outdentStart = startAngle - ccwAngles[0];
        const outdentEnd = cwAngles[1] - endAngle;

        if (outdentStart < 0 && outdentEnd < 0) {
            [arcStartAngle, arcEndAngle] = cw ? cwAngles : ccwAngles;
        } else {
            [arcStartAngle, arcEndAngle, cw] = outdentStart > outdentEnd ? cwAngles : ccwAngles;
        }

        return {
            arcs: [{
                startAngle: arcStartAngle,
                endAngle: arcEndAngle,
                debugInfo: [
                    `Nodes: ${nodesWithAttr.length}/${nodes.length}`,
                    `Not overlapping - ${independentNodes.length}`,
                    overlappingOtherValueNodes.length ? "Overlapping" : "",
                    ...overlappingOtherValueNodes.map(a => `\t${a.overlapsWith.value} - ${a.overlappingCount}`),
                    `Angle: ${arcStartAngle.toFixed(2)} to ${arcEndAngle.toFixed(2)}.`,
                    `Bounds: ${startAngle.toFixed(2)} to ${endAngle.toFixed(2)}`,
                    `CW: ${cw}`
                ].join("\r\n")
            }],
            attrNode
        };
    });
}
