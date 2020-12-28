import {actionDispatcher, getStore} from './state.slice';
import {map, filter, distinctUntilChanged} from 'rxjs/operators';
import readline from 'readline';
// import {initProcess} from '@wfh/plink/wfh/dist';
import chalk from 'chalk';

export function start() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  getStore().pipe(
    distinctUntilChanged((s1, s2) => s1.temperature === s2.temperature && s1._computed.direction === s2._computed.direction),
    map(s => console.log(`Current temperature: ${s.temperature} ${s._computed.direction}`))
  ).subscribe();

  getStore().pipe(
    map(s => s._computed.alert),
    distinctUntilChanged(),
    filter(msg => msg != null),
    map(msg => console.log(chalk.cyan(msg)))
  ).subscribe();

  getStore().pipe(
    map(s => s.error),
    distinctUntilChanged(),
    filter(msg => msg != null),
    map(msg => console.log(chalk.red(msg)))
  ).subscribe();

  console.log('Input new temperature:');

  rl.on('line', (input) => {
    const answer = input.trim();
    if (answer) {
      actionDispatcher.inputTemperature(answer);
    }
  });

  rl.on('SIGINT', () => {
    console.log('Bye.');
    process.exit();
  });

}

