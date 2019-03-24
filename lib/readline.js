const readline = require('readline');

function question(rl) {
  return message =>
    new Promise(resolve => {
      rl.question(message, answer => resolve(answer));
    });
}

function close(rl) {
  return () => rl.close();
}

module.exports = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return { question: question(rl), close: close(rl) };
};
