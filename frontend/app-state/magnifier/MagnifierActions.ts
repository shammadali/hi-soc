import { Action } from "redux";

export type TOGGLE_MAGNIFIER = "TOGGLE MAGNIFIER";

export interface MagnifierToggleAction extends Action {
    type: TOGGLE_MAGNIFIER;
}

export function toggleMagnifier(): MagnifierToggleAction {
    return {
        type: "TOGGLE MAGNIFIER"
    };
}

export type MagnifierActions = MagnifierToggleAction;