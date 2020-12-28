"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = require("@wfh/plink/wfh/dist");
dist_1.initProcess();
dist_1.initConfig({ config: [], prop: [] });
describe('temperature console', () => {
    it('Commone case', () => __awaiter(void 0, void 0, void 0, function* () {
        const { actionDispatcher, getState } = yield Promise.resolve().then(() => __importStar(require('../state.slice')));
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
    }));
});

//# sourceMappingURL=consoleSpec.js.map
