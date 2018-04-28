import { Dispatch, Middleware, Store } from "redux";

import { AppState } from "../store";

import { nodeContentLoad, nodeContentLoadCompleted, nodeListLoadCompleted, NodeSelectorActions } from "./NodeSelectorActions";
import { NodeService } from "./NodeService";

export function nodeSelectorMiddleware(): Middleware {
    const service = new NodeService();

    return (store: Store<AppState>) => (next: Dispatch<NodeSelectorActions>) => (action: NodeSelectorActions) => {

        switch (action.type) {
            case "NODE LIST LOAD": {
                const state = store.getState();

                if (!state.nodeSelector.nodeList) {
                    service.all().then(
                        nodeList => store.dispatch(nodeListLoadCompleted(null, nodeList)),
                        err => store.dispatch(nodeListLoadCompleted(err)));
                }

                break;
            }

            case "NODE SELECTED": {
                const state = store.getState();

                const node = state.nodeSelector.nodes[action.nodeId];

                if (!node || node.error) {
                    store.dispatch(nodeContentLoad(action.nodeId));
                }

                break;
            }

            case "NODE CONTENT LOAD": {
                service.one(action.nodeId).then(
                    node => store.dispatch(nodeContentLoadCompleted(null, action.nodeId, node)),
                    error => store.dispatch(nodeContentLoadCompleted(error, action.nodeId)));

                break;
            }
        }

        return next(action);
    };
}