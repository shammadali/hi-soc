import { select } from "d3";

import { store } from "@frontend/app-state";

import { NODE_DETAILS_FILTER_APPLY, NODE_DETAILS_MOUSEOUT_NODE, NODE_DETAILS_MOUSEOVER_NODE, NodeDetailsActions } from "./NodeDetailsActions";
import { makeRelatedNodesIntersection, makeRelatedNodesUnion } from "../../ui/chord/ChordFilter";


export interface NodeDetailsState {
    hoverHint: string;
    filterHint: string;
}

const defaultState: NodeDetailsState = {
    hoverHint: "",
    filterHint: ""
};

export function nodeDetailsReducer(state: NodeDetailsState = defaultState, action: NodeDetailsActions): NodeDetailsState {

    if (action.type === NODE_DETAILS_MOUSEOVER_NODE) {
        return {
            ...state,
            hoverHint: action.hint ? action.hint.replace(/\r\n/g, "<br/>") : ""
        };
    }

    if (action.type === NODE_DETAILS_MOUSEOUT_NODE) {
        return {
            ...state,
            hoverHint: ""
        };
    }

    if (action.type === NODE_DETAILS_FILTER_APPLY) {
        const { filter } = store.getState();
        const selectedNodesCount: number = Object.values(filter.selectedNodes).length;
        let nodesCount: number;

        if (filter.mode === "union") {
            nodesCount = Object.values(makeRelatedNodesUnion(select("svg"), filter.selectedNodes)).length;
        } else if (filter.mode === "intersection") {
            nodesCount = Object.values(makeRelatedNodesIntersection(select("svg"), filter.selectedNodes)).length + selectedNodesCount;
        }


        if (selectedNodesCount) {
            const filterHint = [
                `Associated nodes count: ${nodesCount}`,
                `${
                    filter.pendingArcs
                        .map(arc => arc.typeHash.replace(/:/g, " -> "))
                        .join("<br/>")
                    }`
            ].join("<br/>");

            return {
                ...state,
                filterHint
            };
        }

        return {
            ...state,
            filterHint: ""
        };
    }

    return state;
}