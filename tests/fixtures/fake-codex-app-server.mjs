import {createInterface} from 'node:readline';

const lines = createInterface({input: process.stdin});
lines.on('line', (line) => {
  const message = JSON.parse(line);
  if (process.argv.includes('--exit') && message.method === 'initialize') process.exit(2);
  if (message.method === 'initialize') reply(message.id, {userAgent: 'fake'});
  if (message.method === 'thread/start' || message.method === 'thread/resume') {
    reply(message.id, {thread: {id: 'fake-thread'}});
  }
  if (message.method === 'turn/start') {
    reply(message.id, {turn: {id: 'fake-turn'}});
    send({id: 900, method: 'item/commandExecution/requestApproval', params: {command: 'echo safe'}});
  }
  if (message.id === 900) {
    send({method: 'item/agentMessage/delta', params: {delta: 'FAKE_OK'}});
    send({method: 'turn/completed', params: {turn: {status: 'completed'}}});
  }
  if (message.method === 'turn/interrupt') {
    reply(message.id, {});
    send({method: 'turn/completed', params: {turn: {status: 'interrupted'}}});
  }
});

function reply(id, result) {
  send({id, result});
}

function send(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}
