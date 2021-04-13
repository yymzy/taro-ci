import build from "./command/build";
import upload from "./command/upload";
import notice from "./command/notice";
import minimist from "minimist";
import chalk from "chalk";
import { readConfig, rewriteProjectConfig } from "utils";
const args = minimist(process.argv.slice(2));

async function init() {
  // 读取ci配置项
  const config = await readConfig();
  const { watch, robot, type = config.type } = args;
  const isWatch = Boolean(watch);
  const isCi = Boolean(robot);
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
        const uploadResponse = await upload(item);
        await notice(item, uploadResponse);
      }
    } catch (err) {
      await notice(item, { error: err });
      console.log(chalk.red("处理失败"), err.message);
    }
  }
}

export default init;
