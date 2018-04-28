import { arc, event } from "d3";

import { AppState, store, toggleFoldArc, toggleSelectArc } from "@frontend/app-state";

import { D3Selection } from "../ChordChartBuilder";
import { attributeClasses } from "../constants";
import { NodeChartData, NodeChord } from "../PrepareData";
import { ArcData, AttributeNodeArcs } from "./interfaces";
import { nodeDetailsMouseOutAction, nodeDetailsMouseOverAction } from "../../../app-state/node-details/NodeDetailsActions";


export function attrChartBuilder(root: D3Selection<any>, arcTree: AttributeNodeArcs[]): void {
    attrChart(root, arcTree);
    attrChartInteractivity(root);
}

export function attrChart(root: D3Selection<any>, arcTree: AttributeNodeArcs[], drawText: boolean = true): void {

    arcTree.forEach((node: AttributeNodeArcs) => {
        const arcBuilder = arc();

        const chart = root.append("g")
            .classed("attr-group", true)
            .datum(node);

        const groups = chart
            .selectAll("g")
            .data(ch => ch.arcs)
            .enter()
            .append("g")
            .classed(`group ${node.node.attrName}`, true);

        groups
            .append("clipPath")
            .attr("id", (d: ArcData) => `clip-${d.id}`)
            .append("path")
            .attr("d", (d: ArcData) => arcBuilder(d as any));

        groups
            .append("path")
            .attr("class", "arc")
            .classed("dashed", (d: ArcData) => d.isOutline)
            .style("stroke", (d: ArcData) => d.color)
            .style("fill", (d: ArcData) => d.isOutline ? null : d.color)
            .attr("d", (d: ArcData) => {
                const builder = arcBuilder
                    .endAngle(d.endAngle + (d.isOutline ? 0 : 1));

                return builder(d as any);
            })
            .attr("id", (d: ArcData) => `node-${d.id}`)
            .attr("clip-path", (d: ArcData) => `url(#clip-${d.id})`)
            .append("title")
            .text((d: ArcData) => d.tooltip);

        if (drawText) {
            groups
                .append("text")
                .attr("x", 6)
                .attr("dy", 13)
                .append("textPath")
                .attr("xlink:href", (d: ArcData) => !d.isOutline && `#node-${d.id}`)
                .text((d: ArcData) => d.text)
                .append("title")
                .text((d: ArcData) => `${d.type.replace(/^[a-z]|-|id|anonymized/g, (match: string) =>
                    match === "-" ||
                    match === "id" ||
                    match === "anonymized" ? " " : match.toUpperCase())} \r\n${d.text}, \r\nNode count: ${d.nodes.length}`
                );
        }

        if (node.children) {
            attrChart(root, node.children, false);
        }
    });
}

export function attrChartInteractivity(root: D3Selection<any>, commonRelationsEnabled: boolean = false): void {
    root.selectAll(attributeClasses)
        .on("mouseover", (d: ArcData) => {
            root.selectAll(".ribbon")
                .classed("inactive", (d2: NodeChord) => commonRelationsEnabled
                    ? !(d.nodes.includes(d2.source.node) && d.nodes.includes(d2.target.node))
                    : !(d.nodes.includes(d2.source.node) || d.nodes.includes(d2.target.node))
                );

            root.selectAll(".group.link")
                .classed("inactive", (d2: NodeChartData) => !d.nodes.includes(d2.node));

            root.selectAll(attributeClasses)
                .classed("inactive", (d2: ArcData) => !(d.typeHash.startsWith(d2.typeHash) || d2.typeHash.startsWith(d.typeHash)));
        })
        .on("mouseout", () => root.selectAll(".group, .ribbon").classed("inactive", false));
}

export function attrChartClickHandler(root: D3Selection<any>): void {
    root.selectAll(attributeClasses)
        .on("mousedown.filtering", (d: ArcData) => {
            if (d.filterable === true) {
                const state: AppState = store.getState();

                if (state.arcTree.foldingModeEnabled === true) {
                    if (event.ctrlKey === true) {
                        return store.dispatch(toggleSelectArc(d));
                    }
                } else {
                    return store.dispatch(toggleSelectArc(d));
                }
            }

            return null;
        });
}

export function foldingClickHandler(root: D3Selection<any>): void {
    root.selectAll(attributeClasses)
        .on("mousedown.folding", (d: ArcData) =>
            d.foldable === true && event.ctrlKey !== true
                ? store.dispatch(toggleFoldArc(d))
                : null
        );
}
