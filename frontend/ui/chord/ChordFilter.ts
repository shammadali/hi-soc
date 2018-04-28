import { intersection } from "lodash";

import { Node } from "@backend/api";
import { ArcsMap, NodesHash, NodesMap } from "@frontend/app-state";
import { ArcData, attributeHierarchy, firstInARowAttrs } from "@frontend/attribute-tree";

import { NodeChartData, NodeChord, colorScale } from "./PrepareData";
import { D3Selection } from "./ChordChartBuilder";
import { attributeClasses } from "./constants";


export function unionFilter(root: D3Selection<any>, pendingNodes: NodesMap, pendingArcs: ArcsMap, selectedNodes: NodesHash, relatedNodes: NodesHash): void {
    root.selectAll(".ribbon")
        .classed("inactive", (d2: NodeChord) => !selectedNodes[d2.source.node.id] && !selectedNodes[d2.target.node.id])
        .filter((d2: NodeChord) => !(!selectedNodes[d2.source.node.id] && !selectedNodes[d2.target.node.id]))
        .style("fill", (d2: NodeChord) =>
            selectedNodes[d2.source.node.id]
                ? colorScale(d2.source.index as any).toString()
                : colorScale(d2.target.index as any).toString()
        );

    root.selectAll(".group.link")
        .classed("inactive", (d2: NodeChartData) =>
            selectedNodes.hasOwnProperty(d2.node.id)
                ? false
                : !pendingNodes.has(d2.node.id) && !relatedNodes[d2.node.id]
        )
        .classed("selected", (d2: NodeChartData) => pendingNodes.has(d2.node.id));

    root.selectAll(attributeClasses)
        .classed("inactive", (d2: ArcData) => d2.nodes.every((node: Node) => !selectedNodes[node.id]))
        .classed("selected", (d2: ArcData) => pendingArcs.has(d2.typeHash));
}

export function intersectionFilter(root: D3Selection<any>, pendingNodes: NodesMap, pendingArcs: ArcsMap, selectedNodes: NodesHash, relatedNodes: number[]): void {
    const attrKeys: string[] = getSelectedAttributes(selectedNodes);

    root.selectAll(".ribbon")
        .classed("inactive", (d2: NodeChord) => {
                if (selectedNodes.hasOwnProperty(d2.source.node.id) && selectedNodes.hasOwnProperty(d2.target.node.id)) {
                    return false;
                }

                return (relatedNodes.length === 0 || Object.keys(selectedNodes).length !== 0)
                    && (
                        (!selectedNodes[d2.source.node.id] && !selectedNodes[d2.target.node.id])
                        || !(
                            relatedNodes.includes(d2.target.node.id)
                            || relatedNodes.includes(d2.source.node.id)
                        )
                    );
            }
        );

    root.selectAll(".group.link")
        .classed("inactive", (d2: NodeChartData) =>
            Object.keys(selectedNodes).length !== 0 && !!selectedNodes[d2.node.id]
                ? false
                : !pendingNodes.has(d2.node.id) && !relatedNodes.includes(d2.node.id)
        )
        .classed("selected", (d2: NodeChartData) => pendingNodes.has(d2.node.id));

    root.selectAll(attributeClasses)
        .classed("inactive", (d2: ArcData) =>
            !pendingArcs.has(d2.typeHash) &&
            (!(attrKeys.includes(`${d2.type}:${d2.text}`) || attrKeys.includes(`${d2.type}:${d2.typeHash}`)))
        )
        .classed("selected", (d2: ArcData) => pendingArcs.has(d2.typeHash));
}

export function makeRelatedNodesUnion(root: D3Selection<any>, selectedNodes: NodesHash): NodesHash {
    const nodes = {};

    root.selectAll(".ribbon")
        .each((d2: NodeChord) => {
            Object.keys(selectedNodes).forEach(nodeID => {
                if (+nodeID === d2.source.node.id || +nodeID === d2.target.node.id) {
                    nodes[d2.source.node.id] = d2.source.node;
                    nodes[d2.target.node.id] = d2.target.node;
                }
            });
        });

    return nodes;
}

export function makeRelatedNodesIntersection(root: D3Selection<any>, selectedNodes: NodesHash): number[] {
    const nodes = {};
    const selectedNodesKeys = Object.keys(selectedNodes);

    selectedNodesKeys.forEach(nodeID => {
        root.selectAll(".ribbon")
            .each((d2: NodeChord) => {
                if (+nodeID === d2.source.node.id) {
                    nodes[d2.target.node.id] = nodes[d2.target.node.id] + 1 || 1;
                } else if (+nodeID === d2.target.node.id) {
                    nodes[d2.source.node.id] = nodes[d2.source.node.id] + 1 || 1;
                }
            });
    });

    return Object.keys(nodes).reduce((accumulator, nodeId) => {
        if (nodes[nodeId] === selectedNodesKeys.length) {
            accumulator.push(+nodeId);
        }

        return accumulator;
    }, []);
}

export function getSelectedAttributes(selectedNodes: NodesHash): string[] {
    const keys = Object.keys(selectedNodes).map(id => {
        const node: Node = selectedNodes[id];

        return Object.keys(node.attributes).reduce((attrs, key) => {
            node.attributes[key].forEach(attr => {
                attrs.push(`${key}:${attr}`);
            });

            return attrs;
        }, []);
    });

    const generalAttributes = intersection(...keys);

    generalAttributes.forEach(attrHash => {
        Object.keys(attributeHierarchy).forEach(key => {
            if (attrHash.startsWith(key)) {
                generalAttributes.push(`attribute-type:${firstInARowAttrs[key]}`);
            }
        });
    });

    return generalAttributes;
}
