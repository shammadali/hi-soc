import * as React from "react";
import * as ReactDOM from "react-dom";
import * as cn from "classnames";
import { Overlay } from "rd-react-overlay";

import { Magnifier } from "../magnifier";

import { ChordChartBuilder } from "./ChordChartBuilder";
import { ChordProps } from "./index";

import "./Chord.scss";


interface ChordComponentState {
    visible: boolean;
    x: number;
    y: number;
}

export class ChordComponent extends React.Component<ChordProps, ChordComponentState> {
    private builder: ChordChartBuilder = new ChordChartBuilder();

    public constructor(props: ChordProps) {
        super(props);

        this.state = {
            visible: false,
            x: 0,
            y: 0
        };
    }

    public componentDidUpdate(prevProps: ChordProps): void {
        const svg = ReactDOM.findDOMNode(this).querySelector("svg");

        if (prevProps.node !== this.props.node && svg) {
            this.builder.build(svg as SVGSVGElement, this.props.node);
        }
    }

    public render(): React.ReactElement<ChordProps> {
        return this.props.loading
            ? <div>Loading...</div>
            : <div style={{ width: "100%" }} className={cn({ "filter-enabled": this.props.filterMode !== "none" })}>
                <button
                    type="button"
                    className={cn("btn btn-default magnifier-button", { "active": this.props.magnifierEnabled })}
                    onClick={() => this.props.toggleMagnifier()}>
                    <span className="glyphicon glyphicon-search"/>
                </button>
                <Magnifier
                    enabled={this.props.magnifierEnabled}
                    width="200px"
                    height="200px"
                    scale={2}>
                    <svg className="chart"
                         preserveAspectRatio="xMinYMin"
                         onContextMenu={(event: any) => this.handleRightClick(event)}
                         onMouseDown={() => this.setState({ visible: false })}/>
                </Magnifier>
                <Overlay visible={this.state.visible}>
                    {
                        (left, top) =>
                            <div className="contextmenu checkbox"
                                 style={{
                                    position: "absolute",
                                    zIndex: 1000,
                                    top: this.state.y,
                                    left: this.state.x
                                 }}>
                                <label>
                                    <input type="checkbox"
                                           checked={this.props.commonRelationsEnabled}
                                           onChange={() => {
                                            this.props.showCommonRelations();
                                            this.setState({ visible: false });
                                           }}/>
                                    Show common relations.
                                </label>
                            </div>
                    }
                </Overlay>
            </div>;
    }

    private handleRightClick(event: MouseEvent): void {
        this.setState({ visible: true, x: event.pageX, y: event.pageY });
        event.preventDefault();
    }
}