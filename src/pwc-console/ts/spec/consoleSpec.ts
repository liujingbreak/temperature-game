import {initProcess, initConfig} from '@wfh/plink/wfh/dist';

initProcess();
initConfig({config: [], prop: []});

describe('temperature console', () => {
  it('Commone case', async () => {

    const {actionDispatcher, getState} = await import('../state.slice');
    actionDispatcher.inputTemperature('50');
    actionDispatcher.inputTemperature('100');
    expect(getState().temperature).toEqual(100);
    expect(getState()._computed.stateIdx).toEqual(3);
    expect(getState()._computed.direction).toEqual('↑');
    expect(getState()._computed.alert).toEqual('');

    actionDispatcher.inputTemperature('100.5');
    expect(getState()._computed.stateIdx).toEqual(3);
    expect(getState()._computed.alert).toEqual('');

    actionDispatcher.inputTemperature('100.6');
    expect(getState()._computed.alert).toEqual('boiling');

    actionDispatcher.inputTemperature('0');
    expect(getState()._computed.alert).toEqual('liquidating');

    actionDispatcher.inputTemperature('-0.5');
    expect(getState()._computed.alert).toEqual('liquidating');

    actionDispatcher.inputTemperature('-0.6');
    expect(getState()._computed.alert).toEqual('freezing');
  });
});
