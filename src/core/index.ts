// import chalk from "chalk";
import build from "./command/build";
import upload from "./command/upload";

// import ora from "ora";
// import chalk from "chalk";
// const spinner = ora().start(chalk.yellow(`项目构建中... \n`));

// if (code !== 0) {
//   // spinner.fail(chalk.red(`项目构建失败:${err} \n`));
// } else {
//   // spinner.succeed(chalk.yellow(`项目构建成功!`));
// }


async function init() {
  await build();
  await upload();
}


export default init;
