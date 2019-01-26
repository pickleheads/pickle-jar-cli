#!/usr/bin/env node

const argv = require('yargs').argv;
const chalk = require('chalk');
const mongoose = require('mongoose');
const pkg = require('../package');
const readline = require('readline');

const Schema = mongoose.Schema;

let db;
let Idea;
const ideaSchema = new Schema({
  idea: String,
  author: { type: String, default: 'picklehead Jackson' },
  date: { type: Date, default: Date.now },
});
let rl;

const HELP_TEXT = `
${chalk.green.bold('pickle-jar')} <cmd> 

  ${chalk.cyan.bold('Commands:')}
    add             Add a new idea
    ls              List existing ideas
    repl            Enter REPL mode

  ${chalk.cyan.bold('Options:')}
    --help, -h      Show help
    --version, -v   Show version\
`;

(async function() {
  await mongoose.connect(
    'mongodb://jumbert:jumbert1@ds141401.mlab.com:41401/idea-jar',
    { useNewUrlParser: true }
  );
  db = mongoose.connection;
  Idea = mongoose.model('Idea', ideaSchema);
  main();
})();

async function main() {
  const command = argv._[0];
  if (!command && (argv.h || argv.help)) {
    console.log(HELP_TEXT);
    process.exit(0);
  }
  if (!command && (argv.v || argv.version)) {
    console.log(`v${pkg.version}`);
    process.exit(0);
  } else if (command === 'ls') {
    await checkoutIdeas();
    process.exit(0);
  } else if (command === 'add') {
    const idea = argv.m || argv.message;
    if (!idea) {
      console.log(chalk.bold.red('Give me an idea you horseradish man, you u'));
      process.exit(1);
    }
    await addIdea(idea);
    process.exit(0);
  } else if (command === 'repl') {
    repl();
  } else {
    console.log(chalk.bold.red('Eat shit motherfucker'));
    process.exit(1);
  }
}

async function repl() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    chalk.bold.cyan('Do you want to add jims (A) or look at jims (L)? '),
    async answer => {
      if (answer.toLowerCase() === 'a') {
        rl.question(
          chalk.bold.cyan('What idea would you like to add? '),
          async idea => {
            await addIdea(idea);
            rl.close();
            process.exit(0);
          }
        );
      } else if (answer.toLowerCase() === 'l') {
        await checkoutIdeas();
        rl.close();
        process.exit(0);
      } else {
        console.log(
          chalk.bold.magenta('you mother fucker pick one of the options')
        );
        rl.close();
        process.exit(1);
      }
    }
  );
}

async function addIdea(idea) {
  await Idea.create({ idea });
  console.log(chalk.green('Idea added successfully:'), idea);
}

async function checkoutIdeas() {
  const ideas = await Idea.find({});
  console.log('');
  ideas.forEach(idea => console.log(chalk.yellow(`- ${idea.idea}`)));
}
