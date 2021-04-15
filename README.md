# taro-ci

基于[微信：miniprogram-ci](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)、[支付宝：miniu](https://opendocs.alipay.com/mini/miniu/command-intro)开发，用于同时打包 weapp、alipay、weapp-third-pro 多版本发布管理；第一个横线后半部分会作为环境变量注入到 Taro 框架小程序中【process.env.MODE_ENV=THIRD-PRO】

**小程序开发必须基于[Taro](https://taro-docs.jd.com/)开发**

---

> 小程序项目根目录下**package.json 配置 script 命令** 注意：目前robot仅支持[1,3]
>
> ```json
> {
>   //...
>   "script": {
>     "dev": "taro-ci --watch", // 开发模式
>     "build": "taro-ci", // 打包
>     "ci:beta": "taro-ci --robot 1 --ci=toolId,privateKey --dd=accessToken,secret", // 发布 - 体验版
>     "ci:rc": "taro-ci --robot 2 --ci=toolId,privateKey --dd=accessToken,secret", // 发布 - 候选版
>     "ci:release": "taro-ci --robot 3 --ci=toolId,privateKey --dd=accessToken,secret" // 发布 - 正式版
>   }
> }
> ```

```js
/**
 * 根目录增加配置文件 taro-ci.config.js
 */

module.exports =  {
  name: "miniapp-wkd",
  version: "1.0.0",
  description: "通用描述信息",
  type: ["weapp","alipay","weapp-third-pro"],
  info: {
    weapp: {
      version: "1.1.0",
      description: "对应版本的针对性描述",
      appId: "wx329184e83305a690"
    },
    "weapp-third": {
      appId: "wx329184e83305a690",
      label: "普通",  // 特殊版本的标签
      tag: "N",      // 特殊版本的标签体现在版本号上 N1.2.0
      robot: 1       // 特殊版本微信上传使用的robot计算依据 1 + (robot-1) *2
    },
    alipay: {
      appId: "支付宝的APPID"
    }
  },
  // 支付宝工具id与私钥
  // ci: {
  //   toolId: "",
  //   privateKey: ""
  // },
  // 钉钉通知（可配置到git项目的CI/CD变量配置中）
  // dd: {
  //   accessToken: "",
  //   secret: ""
  // }
}
```

---

> 微信小程序生成[上传秘钥](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)文件 **private.wx329184e83305a690.key** 放到项目根目录下
---
> 支付宝小程序生成[工具id与私钥](https://opendocs.alipay.com/mini/miniu/command-intro#%E5%88%9D%E5%A7%8B%E5%8C%96%E9%85%8D%E7%BD%AE) 配置到 **taro-ci.config.json中的ci配置项** 或者配置到命令行 **--ci=toolId,privateKey**
---
> 获取的钉钉通知消息所需的**token与秘钥**：找到对应的群 >点击群设置 >智能群助手 >添加机器人 >选择自定义 >确认添加后，选择加签即可获得对应的accessToken与secret，将值配置到 **taro-ci.config.json中的dd配置项** 或者配置到命令行 **--dd=accessToken,secret**
## 使用许可

[MIT](LICENSE) © yymzy
