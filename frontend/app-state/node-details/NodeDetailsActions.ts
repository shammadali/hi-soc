import { Action } from "redux";


export type NODE_DETAILS_MOUSEOVER_NODE = "NODE DETAILS MOUSEOVER NODE";
export const NODE_DETAILS_MOUSEOVER_NODE = "NODE DETAILS MOUSEOVER NODE";

export interface NodeDetailsMouseOverNodeAction extends Action {
    type: NODE_DETAILS_MOUSEOVER_NODE;
    hint: string;
}

export const nodeDetailsMouseOverAction = (hint: string): NodeDetailsMouseOverNodeAction =>
    ({
        type: NODE_DETAILS_MOUSEOVER_NODE,
        hint
    });


export type NODE_DETAILS_MOUSEOUT_NODE = "NODE DETAILS MOUSEOUT NODE";
export const NODE_DETAILS_MOUSEOUT_NODE = "NODE DETAILS MOUSEOUT NODE";

export interface NodeDetailsMouseOutAction extends Action {
    type: NODE_DETAILS_MOUSEOUT_NODE;
}

export const nodeDetailsMouseOutAction = (): NodeDetailsMouseOutAction =>
    ({
        type: NODE_DETAILS_MOUSEOUT_NODE
    });


export type NODE_DETAILS_FILTER_APPLY = "NODE DETAILS FILTER APPLY";
export const NODE_DETAILS_FILTER_APPLY = "NODE DETAILS FILTER APPLY";

export interface NodeDetailsFilterApplyAction extends Action {
    type: NODE_DETAILS_FILTER_APPLY;
}

export const nodeDetailsFilterAppliedAction = (): NodeDetailsFilterApplyAction =>
    ({
        type: NODE_DETAILS_FILTER_APPLY
    });

export type NodeDetailsActions = NodeDetailsMouseOverNodeAction | NodeDetailsMouseOutAction | NodeDetailsFilterApplyAction;