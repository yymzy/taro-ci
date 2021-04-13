import { BuildOptions } from "types";
import { commandTrigger } from "utils";

async function build(item: string, opts: BuildOptions) {
  const { isWatch } = opts
  const [type, ...modes] = item.split("-");

  // 生成打印指令
  let commandStr = `Taro build --type ${type}`;

  if (isWatch) {
    // 开发模式，开启监听
    commandStr += " --watch";
  }

  // 执行命令
  await commandTrigger(commandStr, isWatch, {
    MODE_ENV: modes.join("-").toLocaleUpperCase(),
  });
}


export default build;
