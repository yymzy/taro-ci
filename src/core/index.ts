import build from "./command/build";
import upload from "./command/upload";
import notice from "./command/notice";
import minimist from "minimist";
import chalk from "chalk";
import { readConfig, rewriteProjectConfig } from "utils";
const args = minimist(process.argv.slice(2));

// import ora from "ora";
// import chalk from "chalk";
// const spinner = ora().start(chalk.yellow(`项目构建中... \n`));

// if (code !== 0) {
//   // spinner.fail(chalk.red(`项目构建失败:${err} \n`));
// } else {
//   // spinner.succeed(chalk.yellow(`项目构建成功!`));
// }


async function init() {
  // 读取ci配置项
  const config = await readConfig();
  const { watch, ci, type = config.type } = args;
  const isWatch = Boolean(watch);
  const isCi = Boolean(ci);
  const list = type ? Array.isArray(type) ? type : [type] : null;
  if (!list) return;

  for (let item of list) {
    try {
      // 重写小程序配置项
      await rewriteProjectConfig(item, { isWatch, appId: config.info[item].appId });
      // 打包
      await build(item, { isWatch });
      if (!isWatch && isCi) {
        // 自动化上传
        await upload(item);
        await notice();
      }
    } catch (error) {
      console.log(chalk.red("处理失败"), error.message);
    }
  }


}


export default init;
