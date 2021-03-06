import build from "./command/build";
import upload from "./command/upload";
import notice from "./command/notice";
import ora from "ora";
import chalk from "chalk";
import { rewriteProjectConfig, formateCommand, getArgs, readConfig } from "utils";

async function run(item: string) {
  try {
    const [platform, mode] = formateCommand(item);
    process.env.PLATFORM_ENV = platform;
    process.env.MODE_ENV = mode;
    await notice(await upload(await build(await rewriteProjectConfig(item))));
  } catch (err) {
    ora().fail(chalk.gray(err.message));
  }
}

async function init() {
  // 读取ci配置项
  const config = await readConfig();
  const { type = config.type, isDebug } = getArgs();
  process.env.DEBUG_ENV = isDebug ? "OPEN" : "CLOSE";
  const list = type ? Array.isArray(type) ? type : [type] : null;
  if (!list) return;

  for (let item of list) {
    await run(item)
  }
}

export default init;
