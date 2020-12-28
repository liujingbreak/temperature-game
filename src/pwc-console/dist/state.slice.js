"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStore = exports.getState = exports.actionDispatcher = exports.Observable = void 0;
const store_1 = require("@wfh/plink/wfh/dist/store");
const lodash_1 = __importDefault(require("lodash"));
const rxjs_1 = require("rxjs");
Object.defineProperty(exports, "Observable", { enumerable: true, get: function () { return rxjs_1.Observable; } });
const operators_1 = require("rxjs/operators");
const stateThreshold = [
    {
        rising: 'freezing',
        descending: 'freezing',
        baseTemperature: Number.NEGATIVE_INFINITY,
        isFluctuating: false
    },
    {
        rising: 'unfreezing',
        descending: 'liquidating',
        baseTemperature: 0,
        isFluctuating: false
    },
    {
        rising: 'boiling',
        descending: 'boiling',
        baseTemperature: 100,
        isFluctuating: false
    }
];
const initialState = {
    stateThreshold,
    fluctuating: 0.5,
    temperature: 25,
    _computed: {
        // physicalStates: interpolateFluctuating(stateThreshold, ),
        direction: '',
        alert: ''
    }
};
const sliceOpt = {
    name: 'example',
    initialState,
    reducers: {
        inputTemperature(s, { payload }) {
            const temp = parseFloat(payload);
            if (Number.isNaN(temp)) {
                s.error = `Invalid temperature number: ${payload}`;
                return;
            }
            if (temp > s.temperature) {
                s._computed.direction = '↑';
            }
            else if (temp < s.temperature) {
                s._computed.direction = '↓';
            }
            else {
                s._computed.direction = '';
            }
            const physicalStates = s._computed.physicalStates;
            let idx = lodash_1.default.sortedIndexBy(physicalStates, { baseTemperature: temp, isFluctuating: false }, threshold => threshold.baseTemperature); // idx is from 0 ~ s.physicalStates.length
            if (idx >= physicalStates.length ||
                physicalStates[idx].baseTemperature !== temp ||
                !physicalStates[idx].isFluctuating) {
                idx--;
            }
            s._computed.stateIdx = idx;
            s.temperature = temp;
        }
    }
};
const consoleSlice = store_1.stateFactory.newSlice(sliceOpt);
exports.actionDispatcher = store_1.stateFactory.bindActionCreators(consoleSlice);
store_1.stateFactory.addEpic((action$, state$) => {
    return rxjs_1.merge(
    // initial temperature lookup table
    getStore().pipe(operators_1.distinctUntilChanged((s1, s2) => s1.fluctuating === s2.fluctuating && s1.stateThreshold === s2.stateThreshold), operators_1.map(s => {
        exports.actionDispatcher._change(d => d._computed.physicalStates = interpolateFluctuating(d.stateThreshold, d.fluctuating));
    })), 
    // watch stateIdx changes, generate alert
    getStore().pipe(operators_1.map(s => s._computed.stateIdx), operators_1.distinctUntilChanged(), operators_1.scan((prev, curr) => {
        const ps = getState()._computed.physicalStates;
        if (curr != null && prev != null && ps) {
            if (ps[curr].isFluctuating) {
                console.log(Math.abs(curr - prev));
                if (Math.abs(curr - prev) > 1) {
                    exports.actionDispatcher._change(s => s._computed.alert = curr > prev ? ps[curr - 1].rising : ps[curr + 1].descending);
                }
                else {
                    exports.actionDispatcher._change(s => s._computed.alert = '');
                }
            }
            else {
                exports.actionDispatcher._change(s => s._computed.alert = curr > prev ? ps[curr].rising : ps[curr].descending);
            }
        }
        return curr;
    }))).pipe(operators_1.catchError(err => {
        exports.actionDispatcher._change(s => s.error = err.message);
        return rxjs_1.merge();
    }), operators_1.ignoreElements());
});
function getState() {
    return store_1.stateFactory.sliceState(consoleSlice);
}
exports.getState = getState;
function getStore() {
    return store_1.stateFactory.sliceStore(consoleSlice);
}
exports.getStore = getStore;
function interpolateFluctuating(states, fluct) {
    const ranges = [
        states[0]
    ];
    for (const item of states.slice(1)) {
        ranges.push({
            isFluctuating: true,
            baseTemperature: item.baseTemperature - fluct
        }, Object.assign(Object.assign({}, item), { baseTemperature: item.baseTemperature + fluct }));
    }
    return ranges;
}

//# sourceMappingURL=state.slice.js.map
