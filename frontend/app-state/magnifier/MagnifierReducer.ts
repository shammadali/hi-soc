import { MagnifierActions } from "./MagnifierActions";


export interface MagnifierState {
    enabled: boolean;
}

const defaultState: MagnifierState = {
    enabled: false
};

export function magnifierReducer(state: MagnifierState = defaultState, action: MagnifierActions): MagnifierState {

    switch (action.type) {

        case "TOGGLE MAGNIFIER": {
            return {
                ...state,
                enabled: !state.enabled
            };
        }

    }

    return state;
}