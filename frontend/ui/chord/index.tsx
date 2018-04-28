import * as React from "react";
import { connect } from "react-redux";

import { FilterMode, toggleMagnifier, showCommonRelations } from "@frontend/app-state";
import { NodeContent } from "@backend/api";

import { ChordComponent } from "./Chord";


interface ChordStateProps {
    node: NodeContent;
    filterMode: FilterMode;
    magnifierEnabled: boolean;
    commonRelationsEnabled: boolean;
    loading: boolean;
}

interface ChordDispatchProps {
    showCommonRelations: () => void;
    toggleMagnifier: () => void;
}

export type ChordProps = Partial<ChordStateProps> & Partial<ChordDispatchProps>;

export const Chord = connect<Partial<ChordStateProps>, Partial<ChordDispatchProps>, any>(
    appState => ({
        node: appState.nodeSelector.selectedNode
            ? appState.nodeSelector.nodes[appState.nodeSelector.selectedNode].node
            : null,
        filterMode: appState.filter.mode,
        magnifierEnabled: appState.magnifier.enabled,
        commonRelationsEnabled: appState.arcTree.commonRelationsEnabled,
        loading: appState.nodeSelector.selectedNode && appState.nodeSelector.nodes[appState.nodeSelector.selectedNode].loading
    }),
    dispatch => ({
        showCommonRelations(): void {
            dispatch(showCommonRelations());
        },
        toggleMagnifier(): void {
            dispatch(toggleMagnifier());
        }
    })
)(ChordComponent);