import { Action } from "redux";


export type LastActionState = string;

const defaultState: LastActionState = "";

export function lastActionReducer(state: LastActionState = defaultState, action: Action): LastActionState {
    return action.type;
}