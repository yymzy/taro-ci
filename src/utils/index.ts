import { spawn } from "child_process";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import minimist from "minimist";
import moment from "moment";
import { CommandPromiseRes, EnvCustom, TaroEnv, ConfigOptions, PkgMap, ConfigInfoResponse, Robot, ArgsResponse, ProjectConfig, Platform } from "types";

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
export function commandTrigger(commandStr: string, isWatch: boolean, env?: EnvCustom): Promise<CommandPromiseRes> {
  return new Promise((resolve) => {
    const [command, ...arg] = commandStr.split(/\s/g);
    const subprocess = spawn(command, arg, {
      env: {
        ...process.env,
        ...env
      }
    });

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
    });

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
 * @description 获取命令行参数
 * @returns 
 */
export function getArgs(): ArgsResponse {
  const { ci = "", dd = "", robot = 1, watch, ...rest } = minimist(process.argv.slice(2), { boolean: ["watch"] });
  const [toolId, privateKey] = ci.split(",");
  const [accessToken, secret] = dd.split(",");
  return {
    ci: ci ? { toolId, privateKey } : void (0),
    dd: dd ? { accessToken, secret } : void (0),
    watch,
    robot,
    isWatch: Boolean(watch),
    isCi: Boolean(robot),
    ...rest
  } as ArgsResponse;
}

/**
 * 
 * @description 获取类似Taro的环境变量，包含aliapp，weapp
 * @param item 
 * @returns 
 */
export function getTARO_ENV(): Platform {
  return process.env.PLATFORM_ENV as Platform;
}

/**
 * 
 * @description 输出路径
 * @param item 
 * @param isWatch 
 * @returns 
 */
function createOutPath(item: string, isWatch: boolean): string {
  return item + `.${isWatch ? "dev" : "build"}`
}

/**
 * 
 * @param item 
 * @returns 
 */
export function getProjectConfigPath() {
  const TARO_ENV = getTARO_ENV()
  return path.resolve("./", `${TARO_ENV === TaroEnv.WEAPP ? "project.config" : "mini.project"}.json`)
}

/**
 * 
 * @description 读取项目配置信息
 * @param item 
 * @returns 
 */
export async function readProjectConfig(): Promise<ProjectConfig> {
  const projectConfigPath = getProjectConfigPath();
  const data = fs.readFileSync(projectConfigPath);
  return JSON.parse(data.toString());
}

/**
 * 
 * @description 重写小程序配置文件 project.config.json
 */
export async function rewriteProjectConfig(item: string): Promise<string> {
  const { info } = readConfig();
  const { isWatch } = getArgs();
  const { appId } = info[item] || {};
  const outPath = `dist/${createOutPath(item, isWatch)}`;
  const projectConfigPath = getProjectConfigPath();
  const projectConfig = await readProjectConfig();
  projectConfig.miniprogramRoot = outPath;
  projectConfig.appid = appId;
  fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 4));
  process.env.ROOT_PATH = outPath;

  return item;
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
  const { robot } = getArgs();
  const { version: rV, description: rD, info } = readConfig();
  const { version: iV, description: iD, tag = "", label: iLabel = "", robot: iRobot = 1 } = info[item] || {};
  const { label: pkgLabel, key: pkgKey } = pkgMap[robot + ""];   // [体验版、正式版、临时版]
  const label = formatStrWithLine(pkgLabel, iLabel);
  return {
    robot: robot + (iRobot - 1) * 2 as Robot,
    version: formatStrWithLine(pkgKey, tag + (iV || rV)),
    description: `【${label}版-${moment().format(
      "YYYYMMDDHHmmss"
    )}】：${iD || rD}`,
    label
  }
}

/**
 * 
 * @description 格式化指令，首位为平台信息
 * @param item 
 * @returns 
 */
export function formateCommand(item: string): [Platform, string] {
  const reg = new RegExp(`(${TaroEnv.WEAPP}|${TaroEnv.ALIPAY})([\.|\-]{1})?(.+)?`)
  const [, platform, , mode = ""] = item.match(reg) || []
  return [platform as Platform, mode]
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
