import * as React from "react";
import * as cn from "classnames";
import { connect } from "react-redux";

import { filterApply, filterChangeMode, FilterMode, arcTreeToggleFoldingMode } from "@frontend/app-state";

import "./ControlGroup.scss";


interface ControlGroupStateProps {
    mode?: FilterMode;
    foldingMode?: boolean;
}

interface ControlGroupDispatchProps {
    changeMode?: (mode: FilterMode) => void;
    toggleFoldingMode?: () => void;
    applyFilter?: () => void;
}

export type ControlGroupComponentProps = ControlGroupStateProps & ControlGroupDispatchProps;

function ControlGroupComponent(props: ControlGroupComponentProps): React.ReactElement<ControlGroupComponentProps> {
    const filterModes = [
        { title: "None", value: "none" },
        { title: "Union", value: "union" },
        { title: "Intersection", value: "intersection" }
    ];

    return (
        <div className="input-group control-group">
            <button type="button"
                    className={cn("btn btn-default btn-lg", { "active": props.foldingMode })}
                    onClick={props.toggleFoldingMode}>
                Primary layer: { props.foldingMode ? "on" : "off" }
            </button>
            <select className="form-control"
                    onChange={ e => props.changeMode && props.changeMode(e.currentTarget.value as FilterMode) }
                    value={ props.mode }>
                {
                    filterModes.map(mode =>
                        <option key={mode.value} value={mode.value}>
                            {mode.title}
                        </option>
                    )
                }
            </select>
            {
                props.mode !== "none" &&
                <button type="button"
                        className="btn btn-apply btn-lg"
                        onClick={props.applyFilter}>
                    Apply filter
                </button>
            }
        </div>
    );
}

export const ControlGroup = connect<ControlGroupStateProps, ControlGroupDispatchProps, void>(
    appState => ({
        mode: appState.filter.mode,
        foldingMode: appState.arcTree.foldingModeEnabled
    }),
    dispatch => ({
        toggleFoldingMode(): void {
            dispatch(arcTreeToggleFoldingMode());
        },
        changeMode(mode: FilterMode): void {
            dispatch(filterChangeMode(mode));
        },
        applyFilter(): void {
            dispatch(filterApply());
        }
    })
)(ControlGroupComponent);