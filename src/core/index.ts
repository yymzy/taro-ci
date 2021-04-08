// import chalk from "chalk";
import minimist from "minimist";
import build from "./command/build";
// import upload from "./command/upload"

// import ora from "ora";
// import chalk from "chalk";
// const spinner = ora().start(chalk.yellow(`项目构建中... \n`));

// if (code !== 0) {
//   // spinner.fail(chalk.red(`项目构建失败:${err} \n`));
// } else {
//   // spinner.succeed(chalk.yellow(`项目构建成功!`));
// }

const args = minimist(process.argv.slice(2));

async function init() {
  const { watch } = args;
  const isWatch = Boolean(watch)
  await build(isWatch);

  if (!isWatch) {
    // 生产模式，打包后自动上传到对应平台
    // await upload();
  }
}


export default init;
