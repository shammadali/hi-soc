import * as React from "react";
import { connect } from "react-redux";

import "./NodeDetails.scss";


interface NodeDetailsComponentProps {
    hoverHint: string;
    filterHint: string;
}

const NodeDetailsComponent = (props: NodeDetailsComponentProps): React.ReactElement<NodeDetailsComponentProps> =>
    <aside className="node-details">
        {
            props.hoverHint &&
            <div className="node-details__hover" dangerouslySetInnerHTML={{ __html: props.hoverHint }}/>
        }
        {
            props.filterHint &&
            <div className="node-details__filter" dangerouslySetInnerHTML={{ __html: props.filterHint }}/>
        }
    </aside>;

export const NodeDetails = connect<NodeDetailsComponentProps, void, void>(
    appState => ({
        hoverHint: appState.nodeDetails.hoverHint,
        filterHint: appState.nodeDetails.filterHint
    })
)(NodeDetailsComponent);