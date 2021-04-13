import { spawn } from "child_process";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import minimist from "minimist";
import moment from "moment";
import { CommandPromiseRes, BuildOptions, EnvCustom, TaroEnv, ConfigOptions, PkgMap, ConfigInfoResponse, Robot } from "types";

/**
 * 
 * @description 输出配色，替换关键词
 * @param str 
 * @param tag 
 * @param color 
 * @param isAll
 * @returns 
 */
function keywordTheme(str: string, keyword: string, color: string, isAll: boolean = false): string {
  const rule = new RegExp(`^${keyword}`);
  const isMatch = isAll ? str.includes(keyword) : rule.test(str);
  return isMatch ? isAll ? chalk.hex(color)(str) : str.replace(rule, chalk.hex(color)(keyword)) : ""
}

/**
 * 
 * @description 风格化并打印结果
 */
function consoleBufferByTheme(data: ArrayBuffer): string {
  let str = data.toString().replace(/\n$/g, "");
  if (!str) return ""
  str = keywordTheme(str, "Tips:", "#f5faa4", true)
    || keywordTheme(str, "生成", "#b278ff")
    || keywordTheme(str, "编译", "#00ee76")
    || keywordTheme(str, "编译成功", "#00ee76", true)
    || keywordTheme(str, "监听文件", "#6c6f7d", true)
    || str;
  console.log(str);
  return str;
}

// 发布包对应版本
export const pkgMap: PkgMap = {
  "1": {
    label: "体验",
    key: "Beta"
  },
  "2": {
    label: "候选",
    key: "Rc"
  },
  "3": {
    label: "正式",
    key: ""
  }
};

/**
 * 
 * @description 命令触发器：执行系统指令
 * @param commandStr 命令行字符串
 * @returns 
 */
export function commandTrigger(commandStr: string, isWatch: boolean, env: EnvCustom): Promise<CommandPromiseRes> {
  return new Promise((resolve) => {
    const [command, ...arg] = commandStr.split(/\s/g);

    const subprocess = spawn(command, arg, {
      env: {
        ...process.env,
        ...env
      }
    });

    // 打印当前执行的指令
    console.log(chalk.red("COMMAND:"), commandStr, chalk.red("MODE_ENV:"), env.MODE_ENV)

    // 打印数据输出
    subprocess.stdout.on('data', consoleBufferByTheme);

    // 打印错误输出
    subprocess.stderr.on('data', data => {
      consoleBufferByTheme(data);
      if (isWatch) {
        resolve({ code: 0 });
      }
    });

    subprocess.on("exit", () => {
      if (!isWatch) {
        resolve({ code: 0 });
      }
    })

    // 监听报错信息
    subprocess.on('error', (err) => console.error(err));
  })
}

/**
 * 
 * @description 读取ci配置
 * @param name 
 * @returns 
 */
export function readConfig(name: string = "taro-ci.config.js"): ConfigOptions {
  const config = require(path.resolve("./", name));
  return typeof config === 'function' ? config(merge) : config
}

/**
 * 
 * @description 获取类似Taro的环境变量，包含aliapp，weapp
 * @param item 
 * @returns 
 */
export function getTARO_ENV(item: string) {
  return item.split("-")[0].toUpperCase();
}

/**
 * 
 * @description 输出路径
 * @param item 
 * @param isWatch 
 * @returns 
 */
function createOutPath(item: string, isWatch: boolean): string {
  const paths = item.split("-");
  paths.splice(1, 0, isWatch ? "dev" : "build");
  return paths.join("-")
}

/**
 * 
 * @param item 
 * @returns 
 */
export function getProjectConfigPath(item: string) {
  const TARO_ENV = getTARO_ENV(item);
  return path.resolve("./", `${TARO_ENV === TaroEnv.WEAPP ? "project.config" : "mini.project"}.json`)
}

/**
 * 
 * @description 重写小程序配置文件 project.config.json
 */
export function rewriteProjectConfig(item: string, opts: BuildOptions) {
  return new Promise((resolve, reject) => {
    const { appId, isWatch } = opts
    const outPath = `dist/${createOutPath(item, isWatch)}`;
    const projectConfigPath = getProjectConfigPath(item);
    fs.readFile(projectConfigPath, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      const projectConfig = JSON.parse(data.toString()); //将二进制的数据转换为字符串
      projectConfig.miniprogramRoot = outPath;
      projectConfig.appid = appId;

      fs.writeFile(
        projectConfigPath,
        JSON.stringify(projectConfig, null, 4),
        (err) => {
          if (err) {
            reject(err);
            return false;
          }
          resolve({});
        }
      );
    });
  })
}

/**
 * 
 * @description 将参数组合通过 "-" 连线 
 * @param arg 
 * @returns 
 */
function formatStrWithLine(...arg: Array<string>): string {
  return arg.filter(item => !!item).join("-")
}

/**
 * 
 * @description 获取taro-ci.config.info 并根据一定规则格式化
 * @param item 
 * @param robot 
 */
export function getAndFormatConfigInfo(item: string): ConfigInfoResponse {
  const { robot } = minimist(process.argv.slice(2));
  const { version: rV, description: rD, info } = readConfig();
  const { version: iV, description: iD, tag = "", label: iLabel = "", robot: iRobot = 1 } = info[item];
  const { label: pkgLabel, key: pkgKey } = pkgMap[robot + ""];   // [体验版、正式版、临时版]
  const label = formatStrWithLine(pkgLabel, iLabel);
  return {
    robot: (robot * 1) + (iRobot - 1) * 2 as Robot,
    version: formatStrWithLine(pkgKey, tag + (iV || rV)),
    description: `【${label}版-${moment().format(
      "YYYYMMDDHHmmss"
    )}】：${iD || rD}`,
    label
  }
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
export function isArray(arr) {
  return Array.isArray(arr)
}
/**
 * @description 合并数据
 * @param target 
 * @param arg 
 * @returns 
 */
export function merge(target, ...arg) {
  return arg.reduce((acc, cur) => {
    return Object.keys(cur).reduce((subAcc, key) => {
      const srcVal = cur[key]
      if (isObject(srcVal)) {
        subAcc[key] = merge(subAcc[key] ? subAcc[key] : {}, srcVal)
      } else if (isArray(srcVal)) {
        subAcc[key] = srcVal.map((item, idx) => {
          if (isObject(item)) {
            const curAccVal = subAcc[key] ? subAcc[key] : []
            return merge(curAccVal[idx] ? curAccVal[idx] : {}, item)
          } else {
            return item
          }
        })
      } else {
        subAcc[key] = srcVal
      }
      return subAcc
    }, acc)
  }, target)
}
