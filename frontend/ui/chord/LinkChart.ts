import { arc, ribbon } from "d3";

import { AttributeDataNode } from "@frontend/attribute-tree";
import { NodesHash, store, toggleSelectNode } from "@frontend/app-state";

import { makeRelatedNodesUnion } from "./ChordFilter";
import { ChordChartBuilder, D3Selection } from "./ChordChartBuilder";
import { ChartData, NodeChartData, NodeChord } from "./PrepareData";
import { initialChordSize, attributeClasses } from "./constants";
import { nodeDetailsMouseOutAction, nodeDetailsMouseOverAction } from "../../app-state/node-details/NodeDetailsActions";


export function linkChartBuilder(root: D3Selection<any>, dataSource: ChartData): void {
    linkChart(root, dataSource);
    linkChartInteractivity(root);
}

export function linkChart(root: D3Selection<any>, data: ChartData): void {
    const size = (initialChordSize - 120) / 2;

    const chart = root
        .append("g")
        .classed("link-chart-group", true)
        .datum(data.links);

    // Create groups
    const groups = chart
        .selectAll("g")
        .data(data => data.groups)
        .enter()
        .append("g")
        .classed("group link", true);

    // Create arc sectors
    groups
        .append("path")
        .attr("class", "arc")
        .style("fill", (d: NodeChartData) => d.color)
        .attr("d", arc()
            .innerRadius(size)
            .outerRadius(size + 20) as any
        )
        .append("title")
        .text((d: NodeChartData) => d.tooltip);

    // Create text
    groups
        .append("text")
        .text((d: NodeChartData) => d.node.id)
        .attr("transform", ChordChartBuilder.rotateLabel(size + 30));

    chart.append("g")
        .selectAll("path")
        .data(ch => ch)
        .enter()
        .append("path")
        .attr("class", "ribbon")
        .style("fill", (d: NodeChord) => d.targetColor)
        .attr("d", ribbon()
            .radius(size) as any
        );
}

export function linkChartInteractivity(root: D3Selection<any>): void {
    root.selectAll(".group.link")
        .on("mouseover", (d: NodeChartData) => {
            root.selectAll(".ribbon")
                .classed("inactive", (d2: NodeChord) => d.node.id !== d2.source.node.id && d.node.id !== d2.target.node.id)
                .filter((d2: NodeChord) => !(d.node.id !== d2.source.node.id && d.node.id !== d2.target.node.id))
                .style("fill", (d2: NodeChord) =>
                    d.node.id === d2.source.node.id
                        ? d2.targetColor
                        : d2.sourceColor
                );

            root.selectAll(".group.link")
                .classed("inactive", (d2: NodeChartData) => !d.associatedNodes.includes(d2.node.id) && d2.node.id !== d.node.id);

            root.selectAll(attributeClasses)
                .classed("inactive", (d2: AttributeDataNode) => !d2.nodes.includes(d.node));
        })
        .on("mouseout", () => {
            root.selectAll(".group, .ribbon")
                .classed("inactive", false);

            root.selectAll(".ribbon")
                .style("fill", (d2: NodeChord) => d2.targetColor);
        });
}

export function linkChartClickHandler(root: D3Selection<any>): void {
    root.selectAll(".group.link")
        .on("mousedown", (d: NodeChartData) => store.dispatch(toggleSelectNode(d.node)));
}