import { commandTrigger, readConfig } from "utils";
import minimist from "minimist";
const args = minimist(process.argv.slice(2));

async function build() {
  // 读取配置项
  const config = await readConfig("taro-ci.config.js");
  const { watch, type = config.types } = args;
  const isWatch = Boolean(watch);
  const list = Array.isArray(type) ? type : [type];

  if (!list) return
  console.log("config：", config);

  for (let item of list) {
    try {
      const [type, ...modes] = item.split("-");

      // 生成打印指令
      let commandStr = `Taro build --type ${type}`;
      
      if (isWatch) {
        // 开发模式，开启监听
        commandStr += " --watch";
      }

      // 执行命令
      await commandTrigger(commandStr, {
        MODE_ENV: modes.join("-").toLocaleUpperCase()
      });
    } catch (error) {
      console.log("err", error);
    }
  }
}


export default build;
