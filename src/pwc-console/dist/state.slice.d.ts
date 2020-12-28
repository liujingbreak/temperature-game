import { InferActionsType, PayloadAction } from '@wfh/redux-toolkit-observable/dist/redux-toolkit-observable';
import { Observable } from 'rxjs';
export { Observable };
export interface ConsoleState {
    stateThreshold: StateThreshold[];
    fluctuating: number;
    temperature: number;
    error?: string;
    _computed: {
        direction: '↑' | '↓' | '';
        physicalStates?: StateThreshold[];
        alert: string;
        /** value is index of stateRanges */
        stateIdx?: number;
    };
}
interface StateThreshold {
    rising?: string;
    descending?: string;
    baseTemperature: number;
    isFluctuating: boolean;
}
declare const sliceOpt: {
    name: string;
    initialState: ConsoleState;
    reducers: {
        inputTemperature(s: ConsoleState, { payload }: PayloadAction<string>): void;
    };
};
export declare const actionDispatcher: InferActionsType<typeof sliceOpt>;
export declare function getState(): ConsoleState;
export declare function getStore(): Observable<ConsoleState>;
