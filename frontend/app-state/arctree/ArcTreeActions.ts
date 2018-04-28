import { Action } from "redux";

import { ArcData } from "@frontend/attribute-tree";


export type TOGGLE_FOLDING_MODE = "ARC TREE TOGGLE FOLDING MODE";

export interface ArcTreeToggleFoldingMode extends Action {
    type: TOGGLE_FOLDING_MODE;
}

export function arcTreeToggleFoldingMode(): ArcTreeToggleFoldingMode {
    return {
        type: "ARC TREE TOGGLE FOLDING MODE"
    };
}

export type TOGGLE_ARC = "ARC TREE TOGGLE ARC";

export interface ToggleArcAction extends Action {
    type: TOGGLE_ARC;
    arc: ArcData;
}

export function toggleFoldArc(arc: ArcData): ToggleArcAction {
    return {
        type: "ARC TREE TOGGLE ARC",
        arc
    };
}

export type SHOW_COMMON_RELATIONS = "ARC TREE SHOW COMMON RELATIONS";

export interface ShowCommonRelationsAction extends Action {
    type: SHOW_COMMON_RELATIONS;
}

export function showCommonRelations(): ShowCommonRelationsAction {
    return {
        type: "ARC TREE SHOW COMMON RELATIONS"
    };
}

export type ArcTreeActions =
    ArcTreeToggleFoldingMode
    | ToggleArcAction
    | ShowCommonRelationsAction;