import { zoom, select, event, ChordGroup, Selection, EnterElement } from "d3";

import { NodeContent } from "@backend/api";
import { AppState, FilterMode, NodesHash, NodesMap, store, ArcsMap } from "@frontend/app-state";
import { attrChart, attrChartBuilder, attrChartInteractivity, AttributeNodeArcs, prepareArcTree, foldingClickHandler, attrChartClickHandler, ArcData } from "@frontend/attribute-tree";

import { NodeChartData, NodeChord, prepareData, colorScale } from "./PrepareData";
import { linkChartBuilder, linkChartClickHandler, linkChartInteractivity } from "./LinkChart";
import { intersectionFilter, makeRelatedNodesIntersection, makeRelatedNodesUnion, unionFilter } from "./ChordFilter";
import { attributeClasses } from "./constants";
import { NODE_DETAILS_MOUSEOUT_NODE, NODE_DETAILS_MOUSEOVER_NODE, nodeDetailsMouseOutAction, nodeDetailsMouseOverAction } from "../../app-state/node-details/NodeDetailsActions";


export type D3Selection<Datum> = Selection<Element | EnterElement | Document | Window, Datum, HTMLElement, any>;

export class ChordChartBuilder {
    private appState: AppState = null;
    private root: D3Selection<any>;
    private initialData: NodeContent;
    private initialArcData: AttributeNodeArcs[];
    private rootGroup: D3Selection<any>;

    public build(svg: SVGSVGElement, node: NodeContent): void {
        svg.innerHTML = "";

        const zoomSubscribe = zoom()
            .scaleExtent([1, 20])
            .on("zoom", () => {
                this.rootGroup.attr("transform", event.transform);
            });

        this.initialData = node;
        this.root = select(svg).call(zoomSubscribe);
        this.rootGroup = this.root.append("g");

        const data = prepareData(this.initialData.nodes, this.initialData.links);

        this.initialData.nodes = data.filteredNodes;
        this.initialArcData = prepareArcTree(data.filteredNodes);

        console.log(this.initialArcData, data);

        linkChartBuilder(this.rootGroup, data);
        attrChartBuilder(this.rootGroup, this.initialArcData);

        this.hoverInteractivity(this.root);
        this.toogleHoverInteractivity(this.root);

        ChordChartBuilder.alignChart(this.root);
        ChordChartBuilder.createDefs(this.root);
        ChordChartBuilder.copySvg();

        this.subscribeForFilter();
    }

    private subscribeForFilter(): void {
        store.subscribe(() => {
            this.appState = store.getState() as AppState;

            if (this.appState.lastAction === NODE_DETAILS_MOUSEOVER_NODE || this.appState.lastAction === NODE_DETAILS_MOUSEOUT_NODE) {
                return;
            }

            this.resetAll();

            if (this.appState.arcTree.foldingModeEnabled === true) {
                const primaryArcData = prepareArcTree(this.initialData.nodes, this.appState.arcTree.unfoldedArcs, true);

                attrChart(this.rootGroup, primaryArcData);
                foldingClickHandler(this.rootGroup);
            } else {
                attrChart(this.rootGroup, this.initialArcData);
            }

            if (this.appState.filter.mode === "none") {
                linkChartInteractivity(this.root);
                attrChartInteractivity(this.root, this.appState.arcTree.commonRelationsEnabled);
                this.toogleHoverInteractivity(this.root);
            } else {
                this.switchFilter(this.appState.filter.mode);
                linkChartClickHandler(this.rootGroup);
                attrChartClickHandler(this.rootGroup);
            }

            this.hoverInteractivity(this.root);

            ChordChartBuilder.copySvg();
        });
    }

    private switchFilter(mode: FilterMode): void {
        const selectedNodes: NodesHash = this.appState.filter.selectedNodes;
        const pendingNodes: NodesMap = this.appState.filter.pendingNodes;
        const pendingArcs: ArcsMap = this.appState.filter.pendingArcs;
        const inPending = pendingNodes.size + pendingArcs.size;
        const selectedNodesLength = Object.keys(selectedNodes).length;

        if (!(inPending === 0 && selectedNodesLength === 0)) {
            if (mode === "union") {
                if (selectedNodesLength === 0) {
                    this.rootGroup.selectAll(".group.link")
                        .classed("selected", (d2: NodeChartData) => pendingNodes.has(d2.node.id));

                    this.rootGroup.selectAll(attributeClasses)
                        .classed("selected", (d2: ArcData) => pendingArcs.has(d2.typeHash));
                } else {
                    const relatedNodes: NodesHash = makeRelatedNodesUnion(this.root, selectedNodes);

                    unionFilter(this.rootGroup, pendingNodes, pendingArcs, selectedNodes, relatedNodes);
                }
            } else if (mode === "intersection") {
                const interselected: number = this.appState.filter.interselected;
                const selected: number = this.appState.filter.selected;

                if (interselected === 0 && selected === 0) {
                    this.rootGroup.selectAll(".group.link")
                        .filter((d2: NodeChartData) => pendingNodes.has(d2.node.id))
                        .classed("selected", true)
                        .classed("inactive", false);

                    this.rootGroup.selectAll(attributeClasses)
                        .filter((d2: ArcData) => pendingArcs.has(d2.typeHash))
                        .classed("selected", true)
                        .classed("inactive", false);
                } else {
                    const relatedNodes: number[] = makeRelatedNodesIntersection(this.root, selectedNodes);

                    intersectionFilter(this.rootGroup, pendingNodes, pendingArcs, selectedNodes, relatedNodes);
                }
            }
        }
    }

    private hoverInteractivity(root: D3Selection<any>): void {
        root.selectAll(`${attributeClasses}, .group.link`)
            .on("mouseover.hovering", (d: NodeChartData) => store.dispatch(nodeDetailsMouseOverAction(d.tooltip)))
            .on("mouseout.hovering", () => store.dispatch(nodeDetailsMouseOutAction()));
    }

    private toogleHoverInteractivity(root: D3Selection<any>): void {
        const self = this;

        root.selectAll(`${attributeClasses}, .group.link`)
            .on("mousedown.toggling", function () {
                if (select(this).on("mouseover")) {
                    root.selectAll(".group").on("mouseover mouseout mouseover.hovering mouseout.hovering", null);
                } else {
                    linkChartInteractivity(root);
                    attrChartInteractivity(root, self.appState.arcTree.commonRelationsEnabled);
                    self.hoverInteractivity(root);
                }
            });
    }

    private resetAll(): void {
        this.rootGroup.selectAll(".group")
            .on("mousedown mouseover mouseout", null);

        this.rootGroup.selectAll(".ribbon, .group")
            .classed("inactive selected", false);

        this.rootGroup.selectAll(".ribbon")
            .style("fill", (d2: NodeChord) => colorScale(d2.target.index as any).toString());

        this.rootGroup.selectAll(".attr-group").remove();
    }

    public static copySvg(): void {
        const svg = document.querySelector("svg").cloneNode(true) as SVGSVGElement;
        const defs = svg.querySelector("defs");
        const magnifierLense = document.querySelector(".magnifier__lense-inner");

        svg.removeChild(defs);

        magnifierLense.innerHTML = svg.outerHTML;
    }

    public static createDefs(root: D3Selection<any>): void {
        const defs = root.append("defs");

        const filter = defs.append("filter")
            .attr("id", "grayscale");

        filter
            .append("feColorMatrix")
            .attr("type", "matrix")
            .attr("values", `0.2126 0.7152 0.0722 0 0
                             0.2126 0.7152 0.0722 0 0
                             0.2126 0.7152 0.0722 0 0
                             0      0      0      1 0`);

        const brigthness = filter
            .append("feComponentTransfer");

        brigthness
            .append("feFuncR")
            .attr("type", "linear")
            .attr("slope", "1.3");

        brigthness
            .append("feFuncB")
            .attr("type", "linear")
            .attr("slope", "1.3");

        brigthness
            .append("feFuncG")
            .attr("type", "linear")
            .attr("slope", "1.3");

        defs.append("pattern")
            .attr("id", "pattern-stripe")
            .attr("width", 4)
            .attr("height", 4)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", "rotate(45)")
            .append("rect")
            .attr("width", 2)
            .attr("height", 4)
            .attr("transform", "translate(0,0)")
            .attr("fill", "white");

        defs.append("mask")
            .attr("id", "mask-stripe")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "url(#pattern-stripe)");
    }

    public static alignChart(root: D3Selection<any>): void {
        const svgBbox: SVGRect = (root.node() as SVGSVGElement).getBBox();

        root.attr("viewBox", `${svgBbox.x} ${svgBbox.y} ${svgBbox.width} ${svgBbox.height}`);
    }

    public static rotateLabel(chartOuterRadius: number, labelOffset: number = 2): (this: Element, datum: ChordGroup) => string {
        return function (datum: ChordGroup): string {
            const arcCenterAngleDeg = ChordChartBuilder.radToDeg((datum.startAngle + datum.endAngle) / 2);

            if (arcCenterAngleDeg < 180) {
                return `rotate(${arcCenterAngleDeg - 90}) translate(${chartOuterRadius})`;
            } else {
                const width = this.getClientRects()[0].width;
                return `rotate(${arcCenterAngleDeg - 270}) translate(-${chartOuterRadius + width + labelOffset})`;
            }
        };
    }

    public static radToDeg(rad: number): number {
        return rad * 180 / Math.PI;
    }
}