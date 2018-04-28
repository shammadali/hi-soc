import { applyMiddleware, combineReducers, compose, createStore } from "redux";

import { nodeListLoad, nodeSelected, nodeSelectorMiddleware, nodeSelectorReducer, NodeSelectorState } from "./node-selector";
import { magnifierReducer, MagnifierState } from "./magnifier";
import { filterReducer, FilterState } from "./filter";
import { ArcTreeReducer, ArcTreeState } from "./arctree";
import { nodeDetailsReducer, NodeDetailsState } from "./node-details/NodeDetailsReducer";
import { lastActionReducer, LastActionState } from "./lastAction";
import { nodeDetailsMiddleware } from "./node-details/NodeDetails.middleware";


export interface AppState {
    nodeSelector: NodeSelectorState;
    filter: FilterState;
    arcTree: ArcTreeState;
    magnifier: MagnifierState;
    nodeDetails: NodeDetailsState;
    lastAction: LastActionState;
}

const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;

export const store = createStore(
    combineReducers<AppState>({
        nodeSelector: nodeSelectorReducer,
        filter: filterReducer,
        arcTree: ArcTreeReducer,
        magnifier: magnifierReducer,
        nodeDetails: nodeDetailsReducer,
        lastAction: lastActionReducer
    }),
    composeEnhancers(applyMiddleware(
        nodeSelectorMiddleware(),
        nodeDetailsMiddleware()
    ))
);

store.dispatch(nodeListLoad());
store.dispatch(nodeSelected("3980"));