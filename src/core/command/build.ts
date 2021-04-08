import { commandTrigger } from "utils";

async function build(isWatch: Boolean) {
  const list = ["weapp", "weapp-third"];
  for (let item of list) {
    try {
      const [type, ...modes] = item.split("-");
      let commandStr = `Taro build --type ${type}`;
      if (isWatch) {
        // 开发模式，开启监听
        commandStr = `${commandStr} --watch`;
      }
      await commandTrigger(commandStr, {
        MODE_ENV: modes.join("-").toLocaleUpperCase()
      });
    } catch (error) {
      console.log("err", error);
    }

  }
}


export default build;
