# taro-ci

基于[微信：miniprogram-ci](https://www.npmjs.com/package/miniprogram-ci)、[支付宝：miniu](https://opendocs.alipay.com/mini/miniu/command-intro)开发，用于同时打包 weapp、alipay、weapp-third-pro 多版本发布管理；第一个横线后半部分会作为环境变量注入到 Taro 框架小程序中【process.env.MODE_ENV=THIRD-PRO】

**小程序开发必须基于[Taro](https://taro-docs.jd.com/)开发**

---

> 小程序项目根目录下**package.json 配置 script 命令**
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
  }
```

## 使用许可

[MIT](LICENSE) © yymzy
