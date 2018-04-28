import * as React from "react";
import { connect } from "react-redux";

import { nodeSelected } from "@frontend/app-state";
import { EgoNodeInfo } from "@backend/api";


interface NodeSelectorStateProps {
    nodes: EgoNodeInfo[];
    selectedNodeId: string;
}

interface NodeSelectorDispatchProps {
    onChange: (value: string) => void;
}

export type NodeSelectorComponentProps = NodeSelectorStateProps & NodeSelectorDispatchProps;

const NodeSelectorComponent = (props: NodeSelectorComponentProps): React.ReactElement<NodeSelectorComponentProps> =>
    <div className="input-group">
        <label>Network ID</label>
        <select className="form-control"
                onChange={ e => props.onChange && props.onChange(e.currentTarget.value) }
                value={ props.selectedNodeId }>
            {
                (props.nodes || []).map(n =>
                    <option key={ n.id } value={ n.id }>
                        { n.title }
                    </option>
                )
            }
        </select>
    </div>;

export const NodeSelector = connect<NodeSelectorStateProps, NodeSelectorDispatchProps, void>(
    appState => ({
        nodes: appState.nodeSelector.nodeList,
        selectedNodeId: appState.nodeSelector.selectedNode
    }),
    dispatch => ({
        onChange(value: string): void {
            dispatch(nodeSelected(value));
        }
    })
)(NodeSelectorComponent);