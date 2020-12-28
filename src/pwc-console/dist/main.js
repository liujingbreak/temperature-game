"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const state_slice_1 = require("./state.slice");
const operators_1 = require("rxjs/operators");
const readline_1 = __importDefault(require("readline"));
// import {initProcess} from '@wfh/plink/wfh/dist';
const chalk_1 = __importDefault(require("chalk"));
function start() {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    state_slice_1.getStore().pipe(operators_1.distinctUntilChanged((s1, s2) => s1.temperature === s2.temperature && s1._computed.direction === s2._computed.direction), operators_1.map(s => console.log(`Current temperature: ${s.temperature} ${s._computed.direction}`))).subscribe();
    state_slice_1.getStore().pipe(operators_1.map(s => s._computed.alert), operators_1.distinctUntilChanged(), operators_1.filter(msg => msg != null), operators_1.map(msg => console.log(chalk_1.default.cyan(msg)))).subscribe();
    state_slice_1.getStore().pipe(operators_1.map(s => s.error), operators_1.distinctUntilChanged(), operators_1.filter(msg => msg != null), operators_1.map(msg => console.log(chalk_1.default.red(msg)))).subscribe();
    console.log('Input new temperature:');
    rl.on('line', (input) => {
        const answer = input.trim();
        if (answer) {
            state_slice_1.actionDispatcher.inputTemperature(answer);
        }
    });
    rl.on('SIGINT', () => {
        console.log('Bye.');
        process.exit();
    });
}
exports.start = start;

//# sourceMappingURL=main.js.map
