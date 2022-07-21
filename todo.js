#!/usr/bin/env node

const chalk = require("chalk");
const args = process.argv;
const rl = require("readline");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ todos: [] }).write();

// get todos array
const data = db.get("todos");

const usage = () => {
  const usageText = `
  todo helps you manage you todo tasks.

  usage:
    todo <command>

    commands can be:

    n means the todo number

    new:              used to create a new todo
    get:              used to retrieve your todos
    complete <n>:     used to mark a todo as complete
    delete  <n>:      used to delete a todo
    clear:            used to clear todos
    help:             used to print the usage guide
    --version or -v:  used to check app version
  `;

  console.log(usageText);
};

//  =================  used to log errors to the console in red color =============
const errorLog = (error) => {
  const eLog = chalk.red(error);
  console.log(eLog);
};

// ===================== we make sure the length of the arguments is exactly three ================
if (args.length > 3) {
  if (args[2] != "complete" && args[2] != "delete") {
    errorLog("only one argument can be accepted");
    usage();
  }
}

// ==================== commands =============================
const commands = ["new", "get", "complete", "help", "clear", "delete", "--version", "-v"];

// ======================== check if command is in commands array =====================
if (commands.indexOf(args[2]) == -1) {
  errorLog("invalid command passed");
  usage();
}

// ======================== prompt ===============================
const prompt = (question) => {
  const r = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  return new Promise((resolve, error) => {
    r.question(question, (answer) => {
      r.close();
      resolve(answer);
    });
  });
};

// ========== check version =============
const appVersion = () => {
  console.log("1.0.0");
}

// ======================== add new todo ======================
const newTodo = () => {
  const q = chalk.blue("Type in your todo\n");
  prompt(q).then((todo) => {
    // add todo
    data
      .push({
        title: todo,
        complete: false,
      })
      .write();
  });
};

// ============================ get added todos ====================
const getTodos = () => {
  const todos = data.value();
  let index = 1;
  todos.forEach((todo) => {
    let todoText = `${index++}. ${todo.title}`;
    if (todo.complete) {
      todoText += " ✔ ️";
    }
    const log = todo.complete ? chalk.red(todoText) : chalk.white(todoText);
    console.log(log);
  });
};


// ======================= check tod0 as completed ======================
const completeTodo = () => {
  // check that length
  if (args.length != 4) {
    errorLog("invalid number of arguments passed for complete command");
    return;
  }

  // get number from commandline
  let n = Number(args[3]);

  // check if the value is a number
  if (isNaN(n)) {
    errorLog("please provide a valid number for complete command");
    return;
  }

  // check if correct length of values has been passed
  let todosLength = data.value().length;
  if (n > todosLength) {
    errorLog("invalid number passed for complete command.");
  }

  // update the todo item marked as complete
  db.set(`todos[${n - 1}].complete`, true).write();
};

//clear todos
const clearTodo = () => {
  db.set(`todo`, []).write();
};

//  ============================ delete todo =========================
const deleteTodo = () => {
  // check that length
  if (args.length != 4) {
    errorLog("invalid number of arguments passed for delete command");
    return;
  }

  let n = Number(args[3]);

  // check if the value is a number
  if (isNaN(n)) {
    errorLog("please provide a valid number for delete command");
    return;
  }

  // get todos length
  let todosLength = data.value().length;
  if (n > todosLength) {
    errorLog("invalid number passed for delete command.");
    return;
  }

  // delete the todo item
  data.value().find((todo) => {
    if (todo === data.value()[n - 1]) {
      // prompt message for confirmation
      const q = chalk.red(
        `Are you sure you want to delete ${chalk.green(todo.title)} :(Y/N)\n`
      );
      prompt(q).then((res) => {
        if (res.toLowerCase() === "y") {
          // check if response is y
          data.remove(todo).write();
          console.log(
            chalk.green(
              `${chalk.bgRed(
                todo.title
              )} has been delete\nrun ./todo get to check todos`
            )
          );
        } else if (res.toLowerCase() === "n") {
          // check if response is n
          console.log("ok");
        } else {
          // check if otherwise
          console.log("Command not found");
        }
      });
    }
  });
};


// ======================== check commands ========================
switch (args[2]) {
  case "help":
    usage();
    break;
  case '--version':
    appVersion()
    break
  case '-v':
    appVersion()
    break
  case "new":
    newTodo();
    break;
  case "get":
    getTodos();
    break;
  case "complete":
    completeTodo();
    break;
  case "delete":
    deleteTodo();
    break;
  case "clear":
    clearTodo();
    break;
  default:
    errorLog("Invalid command passed");
    usage();
}


