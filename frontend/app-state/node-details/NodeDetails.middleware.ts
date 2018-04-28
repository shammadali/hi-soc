import { Action, Dispatch, Middleware, Store } from "redux";

import { FILTER_APPLY, FILTER_CHANGE_MODE } from "@frontend/app-state";

import { AppState } from "../store";

import { nodeDetailsFilterAppliedAction } from "./NodeDetailsActions";


export function nodeDetailsMiddleware(): Middleware {
    return (store: Store<AppState>) => (next: Dispatch<any>) => (action: Action) => {
        const dispatch = next(action);

        if (action.type === FILTER_APPLY || action.type === FILTER_CHANGE_MODE) {
            store.dispatch(nodeDetailsFilterAppliedAction());
        }

        return dispatch;
    };
}