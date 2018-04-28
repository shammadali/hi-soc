import { List, Map } from "immutable";
import { intersection } from "lodash";

import { Node } from "@backend/api";
import { ArcData } from "@frontend/attribute-tree";

import { FilterActions, FilterMode } from "./FilterActions";


export type NodesHash = { [id: number]: Node };
export type NodesMap = Map<number, Node>;
export type ArcsMap = Map<string, ArcData>;

export interface FilterState {
    mode: FilterMode;
    selectedNodes: NodesHash;
    interselected: number;
    selected: number;
    pendingNodes: NodesMap;
    pendingArcs: ArcsMap;
}

const defaultState: FilterState = {
    pendingArcs: Map({}) as ArcsMap,
    mode: "none",
    selectedNodes: {},
    interselected: 0,
    selected: 0,
    pendingNodes: Map({}) as any
};

export function filterReducer(state: FilterState = defaultState, action: FilterActions): FilterState {

    switch (action.type) {

        case "FILTER CHANGE MODE": {
            return {
                ...state,
                mode: action.mode,
                pendingNodes: Map({}) as any,
                pendingArcs: Map({}) as any,
                selectedNodes: {},
                interselected: 0,
                selected: 0
            };
        }

        case "TOGGLE SELECT ARC": {
            const selectedArcs: ArcsMap = state.pendingArcs;

            if (selectedArcs.has(action.arc.typeHash)) {
                return {
                    ...state,
                    pendingArcs: selectedArcs.filter(arc => arc.typeHash !== action.arc.typeHash).toMap()
                };
            }

            return {
                ...state,
                pendingArcs: selectedArcs.set(action.arc.typeHash, action.arc)
            };
        }

        case "TOGGLE SELECT NODE": {
            const pendingNodes: NodesMap = state.pendingNodes;

            if (pendingNodes.has(action.node.id)) {
                return {
                    ...state,
                    pendingNodes: pendingNodes.filter(node => node.id !== action.node.id).toMap()
                };
            }

            return {
                ...state,
                pendingNodes: state.pendingNodes.set(action.node.id, action.node)
            };
        }

        case "FILTER APPLY": {
            if (state.mode === "union") {
                const mergedNodes: any = state.pendingArcs
                    .map((arc: ArcData) => List(arc.nodes))
                    .reduce((map: NodesMap, nodes: List<Node>) => {
                        nodes.forEach((node: Node) => {
                            map = map.set(node.id, node);
                        });

                        return map;
                    }, Map() as NodesMap)
                    .merge(state.pendingNodes);

                return {
                    ...state,
                    selectedNodes: mergedNodes.toObject()
                };
            } else {
                let nodes = state.pendingArcs
                    .map((arc: ArcData) => arc.nodes)
                    .toList();

                if (state.pendingNodes.size) {
                    nodes = nodes.push(state.pendingNodes.toArray());
                }

                const intersectedNodes = intersection(...nodes.toArray())
                    .reduce((map, node: Node) => map.set(node.id, node), Map());

                return {
                    ...state,
                    interselected: intersectedNodes.size,
                    selected: nodes.size + state.pendingNodes.size,
                    selectedNodes: intersectedNodes.toObject() as NodesHash
                };
            }
        }
    }

    return state;
}