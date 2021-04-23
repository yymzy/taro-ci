import chalk from "chalk";
import { commandTrigger, getArgs, readConfig } from "utils";

async function build(item: string): Promise<string> {
  const { isWatch } = getArgs();
  const { useTaroPluginBuild = false, useTaroPluginBuildBy } = readConfig()
  const { MODE_ENV, PLATFORM_ENV } = process.env
  // 生成打印指令
  // useTaroPluginBuild 使用taro-plugin-build插件会自定义编译平台
  // useTaroPluginBuildBy 编译平台模式
  let commandStr = `taro build --type ${useTaroPluginBuild ? (useTaroPluginBuildBy === "mode" && MODE_ENV) ? MODE_ENV : item : PLATFORM_ENV}`;

  if (isWatch) {
    // 开发模式，开启监听
    commandStr += " --watch";
  }

  // 打印当前执行的指令
  console.log(chalk.red("编译平台:"), PLATFORM_ENV, chalk.red("版本模式:"), MODE_ENV);
  // 执行命令
  await commandTrigger(commandStr, isWatch);
  return item;
}

export default build;
