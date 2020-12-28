import { stateFactory } from '@wfh/plink/wfh/dist/store';
import { InferActionsType, PayloadAction } from '@wfh/redux-toolkit-observable/dist/redux-toolkit-observable';
import _ from 'lodash';
import { Observable, merge } from 'rxjs';
import {map, distinctUntilChanged, ignoreElements, catchError, scan} from 'rxjs/operators';

/** We have to explicityly export Observable, for exporting getStore() function, otherwise Typescript will report 
 * "This is likely not portable, a type annotation is necessary" 
 * https://github.com/microsoft/TypeScript/issues/30858
 */
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

const stateThreshold: StateThreshold[] = [
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

const initialState: ConsoleState = {
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
    inputTemperature(s: ConsoleState, {payload}: PayloadAction<string>) {
      const temp = parseFloat(payload);
      if (Number.isNaN(temp)) {
        s.error = `Invalid temperature number: ${payload}`;
        return;
      }

      if (temp > s.temperature) {
        s._computed.direction = '↑';
      } else if (temp < s.temperature) {
        s._computed.direction = '↓';
      } else {
        s._computed.direction = '';
      }

      const physicalStates = s._computed.physicalStates!;
      let idx = _.sortedIndexBy(physicalStates, {baseTemperature: temp, isFluctuating: false},
        threshold => threshold.baseTemperature); // idx is from 0 ~ s.physicalStates.length

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

const consoleSlice = stateFactory.newSlice(sliceOpt);

export const actionDispatcher: InferActionsType<typeof sliceOpt> = stateFactory.bindActionCreators(consoleSlice);

stateFactory.addEpic<{example: ConsoleState}>((action$, state$) => {
  return merge(
    // initial temperature lookup table
    getStore().pipe(
      distinctUntilChanged<ConsoleState>((s1, s2) => s1.fluctuating === s2.fluctuating && s1.stateThreshold === s2.stateThreshold),
      map(s => {
        actionDispatcher._change(d => d._computed.physicalStates = interpolateFluctuating(d.stateThreshold, d.fluctuating))
      })
    ),

    // watch stateIdx changes, generate alert
    getStore().pipe(
      map(s => s._computed.stateIdx),
      distinctUntilChanged(),
      scan((prev, curr) => {
        const ps = getState()._computed.physicalStates;
        if (curr != null && prev != null && ps) {
          if (ps[curr].isFluctuating) {
            console.log(Math.abs(curr - prev));
            if (Math.abs(curr - prev) > 1) {
              actionDispatcher._change(s => s._computed.alert = curr > prev ? ps[curr - 1].rising! : ps[curr + 1].descending!);
            } else {
              actionDispatcher._change(s => s._computed.alert = '');
            }
          } else {
            actionDispatcher._change(s => s._computed.alert = curr > prev ? ps[curr].rising! : ps[curr].descending!);
          }
        }
        return curr;
      })
    )
  ).pipe(
    catchError(err => {
      actionDispatcher._change(s => s.error = err.message);
      return merge();
    }),
    ignoreElements()
  );
});

export function getState() {
  return stateFactory.sliceState(consoleSlice);
}

export function getStore() {
  return stateFactory.sliceStore(consoleSlice);
}

function interpolateFluctuating(states: StateThreshold[], fluct: number) {
  const ranges: StateThreshold[] = [
    states[0]
  ];
  for (const item of states.slice(1)) {
    ranges.push({
        isFluctuating: true,
        baseTemperature: item.baseTemperature - fluct
      },
      {
        ...item,
        baseTemperature: item.baseTemperature + fluct
      }
    );
  }
  return ranges;
}
