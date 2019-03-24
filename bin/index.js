#!/usr/bin/env node

const argv = require('yargs').argv;
const chalk = require('chalk');
const pkg = require('../package');
const readline = require('../lib/readline')();
const { api } = require('../lib/api');

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
  await main();
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
    const status = argv.status;
    const long = argv.l;
    const options = { long };
    await listIdeas(status, options);
    process.exit(0);
  } else if (command === 'add') {
    const idea = argv.m || argv.message;
    if (!idea) {
      console.log(chalk.bold.red('Give me an idea you horseradish man, you u'));
      process.exit(1);
    }
    const categories = argv.category;
    const ideaToCreate = {
      idea,
      ...(categories && { categories }),
    };
    await addIdea(ideaToCreate);
    process.exit(0);
  } else if (command === 'repl') {
    await repl();
  } else {
    console.log(chalk.bold.red('Eat shit motherfucker'));
    process.exit(1);
  }
}

async function repl() {
  const command = await readline.question(
    chalk.bold.cyan('Do you want to add jims (A) or look at jims (L)? ')
  );
  let exitCode = 0;
  if (command.toLowerCase() === 'a') {
    const idea = await readline.question(
      chalk.bold.cyan('What idea would you like to add? ')
    );
    const categories = await readline.question(
      chalk.bold.cyan(
        'Do you want to add to any categories? Separate categories by comma. '
      )
    );
    const ideaToCreate = {
      idea,
      ...(categories && { categories: categories.split(',') }),
    };
    await addIdea(ideaToCreate);
  } else if (command.toLowerCase() === 'l') {
    await listIdeas();
  } else {
    console.log(
      chalk.bold.magenta('you mother fucker pick one of the options')
    );
    exitCode = 1;
  }
  readline.close();
  process.exit(exitCode);
}

async function addIdea(ideaToCreate) {
  const { idea: createdIdea } = await api.addIdea({ body: ideaToCreate });
  console.log(chalk.green('Idea added successfully:'), createdIdea.idea);
}

async function listIdeas(status, options) {
  const { long } = options;
  const query = {};
  if (status) {
    query.status = status;
  }
  const { ideas } = await api.listIdeas({ query });
  if (long) {
    console.table(ideas);
  } else {
    ideas.forEach(({ idea }) => console.log(chalk.yellow(`- ${idea}`)));
  }
}

async function handleRejection(err) {
  if (err) {
    await handleUnexpected(err);
  } else {
    console.error('An unexpected empty rejection occurred');
  }
  process.exit(1);
}

async function handleUnexpected(err) {
  console.error(
    `An unexpected error occurred!\n  ${err.message}\n ${err.stack}`
  );
  process.exit(1);
}

process.on('unhandledRejection', handleRejection);
process.on('uncaughtException', handleUnexpected);
