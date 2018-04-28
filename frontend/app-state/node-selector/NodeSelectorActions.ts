import { Action } from "redux";

import { EgoNodeInfo, NodeContent } from "@backend/api";

export type NODE_LIST_LOAD = "NODE LIST LOAD";

export interface NodeListLoadAction extends Action {
    type: NODE_LIST_LOAD;
}

export function nodeListLoad(): NodeListLoadAction {
    return {
        type: "NODE LIST LOAD"
    };
}

export type NODE_LIST_LOAD_DONE = "NODE LIST LOADED";

export interface NodeListLoadedOkAction extends Action {
    type: NODE_LIST_LOAD_DONE;
    ok: true;
    nodes: EgoNodeInfo[];
}

export interface NodeListLoadedErrorAction extends Action {
    type: NODE_LIST_LOAD_DONE;
    ok: false;
    error: any;
}

export type NodeListLoadedAction = NodeListLoadedOkAction | NodeListLoadedErrorAction;

export function nodeListLoadCompleted(error: any, nodes?: EgoNodeInfo[]): NodeListLoadedAction {
    if (error) {
        return {
            type: "NODE LIST LOADED",
            ok: false,
            error
        };
    }

    return {
        type: "NODE LIST LOADED",
        ok: true,
        nodes
    };
}

export type NODE_CONTENT_LOAD = "NODE CONTENT LOAD";

export interface NodeContentLoadAction extends Action {
    type: NODE_CONTENT_LOAD;
    nodeId: string;
}

export function nodeContentLoad(nodeId: string): NodeContentLoadAction {
    return {
        type: "NODE CONTENT LOAD",
        nodeId
    };
}

export type NODE_CONTENT_LOADED = "NODE CONTENT LOADED";

export interface NodeContentLoadedOkAction extends Action {
    type: NODE_CONTENT_LOADED;
    nodeId: string;
    ok: true;
    node: NodeContent;
}

export interface NodeContentLoadErrorAction extends Action {
    type: NODE_CONTENT_LOADED;
    nodeId: string;
    ok: false;
    error: any;
}

export type NodeContentLoadedAction = NodeContentLoadedOkAction | NodeContentLoadErrorAction;

export function nodeContentLoadCompleted(error: any, nodeId: string, node?: NodeContent): NodeContentLoadedAction {
    if (error) {
        return {
            type: "NODE CONTENT LOADED",
            nodeId,
            ok: false,
            error
        };
    }

    return {
        type: "NODE CONTENT LOADED",
        nodeId,
        ok: true,
        node
    };
}

export type NODE_SELECTED = "NODE SELECTED";

export interface NodeSelectedAction {
    type: NODE_SELECTED;
    nodeId: string;
}

export function nodeSelected(nodeId: string): NodeSelectedAction {
    return {
        type: "NODE SELECTED",
        nodeId
    };
}

export type NodeSelectorActions = NodeListLoadAction | NodeListLoadedAction |
    NodeContentLoadAction | NodeContentLoadedAction |
    NodeSelectedAction;