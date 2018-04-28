import { Action } from "redux";

import { Node } from "@backend/api";
import { ArcData } from "@frontend/attribute-tree";


export type FILTER_CHANGE_MODE = "FILTER CHANGE MODE";
export const FILTER_CHANGE_MODE = "FILTER CHANGE MODE";

export type FilterMode = "none" | "union" | "intersection";

export interface FilterChangeModeAction extends Action {
    type: FILTER_CHANGE_MODE;
    mode: FilterMode;
}

export function filterChangeMode(mode: FilterMode): FilterChangeModeAction {
    return {
        type: FILTER_CHANGE_MODE,
        mode
    };
}

export type TOGGLE_SELECT_ARC = "TOGGLE SELECT ARC";
export const TOGGLE_SELECT_ARC = "TOGGLE SELECT ARC";

export interface ToggleSelectArcAction extends Action {
    type: TOGGLE_SELECT_ARC;
    arc: ArcData;
}

export function toggleSelectArc(arc: ArcData): ToggleSelectArcAction {
    return {
        type: TOGGLE_SELECT_ARC,
        arc
    };
}

export type TOGGLE_SELECT_NODE = "TOGGLE SELECT NODE";
export const TOGGLE_SELECT_NODE = "TOGGLE SELECT NODE";

export interface ToggleSelectNodeAction extends Action {
    type: TOGGLE_SELECT_NODE;
    node: Node;
}

export function toggleSelectNode(node: Node): ToggleSelectNodeAction {
    return {
        type: TOGGLE_SELECT_NODE,
        node
    };
}

export type FILTER_APPLY = "FILTER APPLY";
export const FILTER_APPLY = "FILTER APPLY";

export interface FilterApplyAction extends Action {
    type: FILTER_APPLY;
}

export function filterApply(): FilterApplyAction {
    return {
        type: FILTER_APPLY
    };
}

export type FilterActions =
    FilterChangeModeAction
    | ToggleSelectArcAction
    | ToggleSelectNodeAction
    | FilterApplyAction;