import { chord, ChordGroup, ChordSubgroup, scaleOrdinal, schemeCategory20b } from "d3";

import { Link, Node } from "@backend/api";


export interface NodeChartData extends ChordGroup {
    node: Node;
    associatedNodes: number[];
    tooltip?: string;
    color?: string;
}

export interface NodeChordSubgroup extends ChordSubgroup {
    node: Node;
}

export interface NodeChord {
    source: NodeChordSubgroup;
    target: NodeChordSubgroup;
    sourceColor: string;
    targetColor: string;
}

export interface LinksChords extends Array<NodeChord> {
    groups: NodeChartData[];
}

export interface ChartData {
    nodes: NodeChartData[];
    filteredNodes: Node[];
    links: LinksChords;
}

export const colorScale = scaleOrdinal()
    .range(schemeCategory20b);

const nodeColor = (index: number): string => colorScale(index as any).toString();

export function prepareData(nodes: Node[], links: Link[]): ChartData {
    if (!nodes) {
        throw new Error("Node array is not defined.");
    }
    if (!links) {
        throw new Error("Links array is not defined.");
    }

    links.forEach((item) => {
        item.value = 1;
    });

    nodes = nodes.filter(n => links.some(l => l.from === n.id || l.to === n.id));

    const linkChords = buildLinkChord(nodes, links);

    return {
        nodes: linkChords.groups,
        filteredNodes: nodes,
        links: linkChords
    };
}

function buildLinkMatrix(nodes: Node[], links: Link[]): number[][] {
    const result = emptyMatrix(nodes.length);

    const indexFromNodeId: { [nodeId: number]: number } = nodes.reduce((result, node, index) => {
        result[node.id] = index;
        return result;
    }, {});

    links.forEach(l => {
        const fromIndex = indexFromNodeId[l.from];
        const toIndex = indexFromNodeId[l.to];

        result[fromIndex][toIndex] += 1;
        result[toIndex][fromIndex] += 1;
    });

    return result;
}

function emptyMatrix(size: number): number[][] {
    const result: number[][] = [];

    for (let i = 0; i < size; i++) {
        const arr: number[] = [];

        for (let j = 0; j < size; j++) {
            arr.push(0);
        }

        result.push(arr);
    }

    return result;
}

function buildLinkChord(nodes: Node[], links: Link[]): LinksChords {
    const chordBuilder = chord();
    const linkMatrix = buildLinkMatrix(nodes, links);
    const linkChords = chordBuilder(linkMatrix);

    linkChords.groups = linkChords.groups
        .map<NodeChartData>(g => ({
            ...g,
            node: nodes[g.index],
            associatedNodes: []
        }));

    linkChords.forEach((l: NodeChord) => {
        l.source["node"] = nodes[l.source.index];
        l.target["node"] = nodes[l.target.index];

        l.targetColor = colorScale(l.target.index as any).toString();
        l.sourceColor = colorScale(l.source.index as any).toString();

        (linkChords.groups[l.source.index] as NodeChartData).associatedNodes.push(l.target["node"].id);
        (linkChords.groups[l.target.index] as NodeChartData).associatedNodes.push(l.source["node"].id);
    });

    linkChords.groups = linkChords.groups.map((g: NodeChartData) => {
        const node = g.node;
        const attrNames = Object.keys(node.attributes)
            .map(an => `${an}: ${node.attributes[an].join("::")}`)
            .join("\r\n");

        const associatedNodes = g.associatedNodes.map((nodeId, index) =>
            (index + 1) === g.associatedNodes.length
                ? `${nodeId}`
                : (index + 1) % 4 === 0
                ? `${nodeId},\r\n`
                : `${nodeId}, `
        ).join("");

        return {
            ...g,
            color: nodeColor(g.index),
            tooltip: [
                `Node ${node.id}, Links from: ${g.value}`,
                attrNames,
                `Associated nodes: ${g.associatedNodes.length}`,
                `(${associatedNodes})`
            ].join("\r\n")
        };
    });

    return linkChords as LinksChords;
}