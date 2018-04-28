import { Map } from "immutable";

import { ArcData } from "@frontend/attribute-tree";

import { ArcTreeActions } from "./ArcTreeActions";


export interface ArcTreeState {
    foldingModeEnabled: boolean;
    commonRelationsEnabled: boolean;
    unfoldedArcs: Map<string, ArcData>;
}

const defaultState: ArcTreeState = {
    foldingModeEnabled: false,
    commonRelationsEnabled: false,
    unfoldedArcs: Map({}) as Map<string, ArcData>
};

export function ArcTreeReducer(state: ArcTreeState = defaultState, action: ArcTreeActions): ArcTreeState {

    switch (action.type) {

        case "ARC TREE TOGGLE FOLDING MODE": {
            return {
                ...state,
                foldingModeEnabled: !state.foldingModeEnabled
            };
        }

        case "ARC TREE TOGGLE ARC": {
            const toggledArcs: Map<string, ArcData> = state.unfoldedArcs;

            if (toggledArcs.has(action.arc.typeHash)) {
                return {
                    ...state,
                    unfoldedArcs: toggledArcs.filter(arc => arc.typeHash !== action.arc.typeHash).toMap()
                };
            }

            return {
                ...state,
                unfoldedArcs: toggledArcs.set(action.arc.typeHash, action.arc)
            };
        }

        case "ARC TREE SHOW COMMON RELATIONS": {
            return {
                ...state,
                commonRelationsEnabled: !state.commonRelationsEnabled
            };
        }
    }

    return state;
}