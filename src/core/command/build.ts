import chalk from "chalk";
import { commandTrigger, getArgs, readConfig } from "utils";

async function build(item: string): Promise<string> {
  const { isWatch } = getArgs();
  const { useTaroPluginBuildBy } = readConfig()
  const { MODE_ENV, PLATFORM_ENV } = process.env
  // 生成打印指令
  // useTaroPluginBuild 使用taro-plugin-build插件会自定义编译平台
  // useTaroPluginBuildBy 编译平台模式 [mode,type,normal]
  let commandStr = `taro build --type ${useTaroPluginBuildBy === "type" ? item : (useTaroPluginBuildBy === "mode" && MODE_ENV) ? MODE_ENV : PLATFORM_ENV}`;

  if (isWatch) {
    // 开发模式，开启监听
    commandStr += " --watch";
  }

  // 打印当前执行的指令
  console.log(chalk.grey("编译平台:"), chalk.red(PLATFORM_ENV), chalk.grey("版本模式:"), chalk.red(MODE_ENV || "默认"));
  // 执行命令
  await commandTrigger(commandStr, isWatch, item);
  return item;
}

export default build;
