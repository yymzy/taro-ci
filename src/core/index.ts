import build from "./command/build";
import upload from "./command/upload";
import notice from "./command/notice";
import chalk from "chalk";
import { getArgs, readConfig, rewriteProjectConfig } from "utils";

async function init() {
  // 读取ci配置项
  const config = await readConfig();
  const { watch, robot, type = config.type } = getArgs();
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
      console.log(chalk.red("处理失败"), err.message);
      await notice(item, { error: err });
    }
  }
}

export default init;
