import { EgoNodeInfo, NodeContent } from "@backend/api";

import { NodeSelectorActions } from "./NodeSelectorActions";


export interface NodeSelectorState {
    nodeList: EgoNodeInfo[];
    nodeListLoading: boolean;
    nodeListLoadingError: any;

    nodes: {
        [nodeId: string]: {
            node: NodeContent;
            loading: boolean;
            error: any;
        };
    };
    selectedNode: string;
}

const defaultState: NodeSelectorState = {
    nodeList: null,
    nodeListLoading: false,
    nodeListLoadingError: null,

    nodes: {},
    selectedNode: ""
};

export function nodeSelectorReducer(state: NodeSelectorState = defaultState, action: NodeSelectorActions): NodeSelectorState {

    switch (action.type) {
        case "NODE LIST LOAD": {

            if (state.nodeList) {
                return state;
            }

            return {
                ...state,
                nodeList: null,
                nodeListLoadingError: null,
                nodeListLoading: true
            };
        }

        case "NODE LIST LOADED": {

            if (action.ok === false) {
                return {
                    ...state,
                    nodeList: null,
                    nodeListLoading: false,
                    nodeListLoadingError: action.error
                };
            }

            return {
                ...state,
                nodeList: [
                    {
                        id: null,
                        title: "Choose Node..."
                    },
                    ...action.nodes
                ],
                nodeListLoading: false,
                nodeListLoadingError: null
            };
        }

        case "NODE CONTENT LOAD": {
            const node = state.nodes[action.nodeId];

            if (!node || node.error) {
                return {
                    ...state,
                    nodes: {
                        ...state.nodes,
                        [action.nodeId]: {
                            node: null,
                            loading: true,
                            error: null
                        }
                    }
                };
            }

            return state;
        }

        case "NODE CONTENT LOADED": {

            if (action.ok === false) {
                return {
                    ...state,
                    nodes: {
                        ...state.nodes,
                        [action.nodeId]: {
                            loading: false,
                            node: null,
                            error: action.error
                        }
                    }
                };
            }

            return {
                ...state,
                nodes: {
                    ...state.nodes,
                    [action.nodeId]: {
                        loading: false,
                        node: action.node,
                        error: null
                    }
                }
            };
        }

        case "NODE SELECTED": {
            return {
                ...state,
                selectedNode: action.nodeId
            };
        }
    }

    return state;
}