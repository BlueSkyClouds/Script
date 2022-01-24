/*
爱奇艺会员签到脚本
更新时间: 2022.1.21
脚本兼容: QuantumultX, Surge4, Loon, JsBox, Node.js
电报频道: @NobyDa
问题反馈: @NobyDa_bot
获取Cookie说明：
打开爱奇艺App后(AppStore中国区)，点击"我的", 如通知成功获取cookie, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9:00执行, 您可以修改执行时间。
如果使用Node.js, 需自行安装'request'和'string-random'模块. 例: npm install request -g
JsBox, Node.js用户抓取Cookie说明：
开启抓包, 打开爱奇艺App后(AppStore中国区)，点击"我的" 返回抓包App 搜索请求头关键字 将cookie全部字段写入cookie
提取字母数字混合字段, 到&结束, 填入以下单引号内即可.
*/

var cookie = '';

let P00001 = '';
let P00003 = '';
let dfp = '';


const timestamp = new Date().getTime()
/*********************
 QuantumultX 远程脚本配置:
 **********************
 [task_local]
 # 爱奇艺会员签到
 0 9 * * * https://raw.githubusercontent.com/BlueSkyClouds/Script/master/nodejs/iQIYI-bak.js
 [rewrite_local]
 # 获取Cookie
 ^https?:\/\/iface(\d)?\.iqiyi\.com\/ url script-request-header https://raw.githubusercontent.com/BlueSkyClouds/Script/master/nodejs/iQIYI-bak.js
 [mitm]
 hostname= ifac*.iqiyi.com
 **********************
 Surge 4.2.0+ 脚本配置:
 **********************
 [Script]
 爱奇艺签到 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/BlueSkyClouds/Script/master/nodejs/iQIYI-bak.js
 爱奇艺获取Cookie = type=http-request,pattern=^https?:\/\/iface(\d)?\.iqiyi\.com\/,script-path=https://raw.githubusercontent.com/BlueSkyClouds/Script/master/nodejs/iQIYI-bak.js
 [MITM]
 hostname= ifac*.iqiyi.com
 ************************
 Loon 2.1.0+ 脚本配置:
 ************************
 [Script]
 # 爱奇艺签到
 cron "0 9 * * *" script-path=https://raw.githubusercontent.com/BlueSkyClouds/Script/master/nodejs/iQIYI-bak.js
 # 获取Cookie
 http-request ^https?:\/\/iface(\d)?\.iqiyi\.com\/ script-path=https://raw.githubusercontent.com/BlueSkyClouds/Script/master/nodejs/iQIYI-bak.js
 [Mitm]
 hostname= ifac*.iqiyi.com
 */
var LogDetails = false; // 响应日志
var tasks = ["8a2186bb5f7bedd4", "b6e688905d4e7184", "acf8adbb5870eb29", "843376c6b3e2bf00", "8ba31f70013989a8", "CHANGE_SKIN"]; //浏览任务号

var out = 10000; // 超时 (毫秒) 如填写, 则不少于3000

var $nobyda = nobyda();


(async () => {
  out = $nobyda.read("iQIYI_TimeOut") || out
  cookie = cookie || $nobyda.read("CookieQY")
  LogDetails = $nobyda.read("iQIYI_LogDetails") === "true" ? true : LogDetails
  if(cookie){
    if(cookie.includes("__dfp") && cookie.includes("P00001") && cookie.includes("P00003")){
    dfp = cookie.match(/__dfp=(.*?)@/)[1];
    P00001 = cookie.match(/P00001=(.*?);/)[1];
    P00003 = cookie.match(/P00003=(.*?);/)[1];
    }
  }

  if (P00001 !== "" && P00003 !== "" && dfp !== "") {
    await login();
    await Checkin();
    await WebCheckin();
    await Lottery(500);
    for (let i = 0; i < tasks.length; i++){
      await joinTask(tasks[i]);
      await notifyTask(tasks[i]);
      await new Promise(r => setTimeout(r, 5000));
      await getTaskRewards(tasks[i]);
    }
    await $nobyda.time();
  } else {
    $nobyda.notify("爱奇艺会员", "", "签到终止, 由于爱奇艺更新了新的签到获取Cookie方式有所变更详情查看https://github.com/MayoBlueSky/My-Actions/blob/master/Secrets.md");
    //$nobyda.notify("爱奇艺会员", "", "签到终止, 未获取Cookie");
  }
})().finally(() => {
  $nobyda.done();
})

function login() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://serv.vip.iqiyi.com/vipgrowth/query.action?P00001=' + P00001,
    }
    $nobyda.get(URL, function(error, response, data) {
      const obj = JSON.parse(data)
      const Details = LogDetails ? data ? `response:\n${data}` : '' : ''
      if (!error && obj.code === "A00000" ) {
        const level = obj.data.level  // VIP等级
        const growthvalue = obj.data.growthvalue  // 当前 VIP 成长值
        const distance = obj.data.distance  // 升级需要成长值
        let deadline = obj.data.deadline  // VIP 到期时间
        const today_growth_value = obj.data.todayGrowthValue
        if(deadline === undefined){deadline = "非 VIP 用户"}
        $nobyda.expire = ("\nVIP 等级: " + level + "\n当前成长值: " + growthvalue + "\n升级需成长值: " + distance + "\n今日成长值: " + today_growth_value + "\nVIP 到期时间: " + deadline)
        //P00003 = data.match(/img7.iqiyipic.com\/passport\/.+?passport_(.*?)_/)[1]   //通过头像链接获取userid P00003
        console.log(`爱奇艺-查询成功: ${$nobyda.expire} ${Details}`)
      } else {
        console.log(`爱奇艺-查询失败${error || ': 无到期数据 ⚠️'} ${Details}`)
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function Checkin() {
  const stringRandom = require('string-random');
  return new Promise(resolve => {
    const sign_date = {
      agentType: "1",
      agentversion: "1.0",
      appKey: "basic_pcw",
      authCookie: P00001,
      qyid: md5(stringRandom(16)),
      task_code: "natural_month_sign",
      timestamp: timestamp,
      typeCode: "point",
      userId: P00003,
    };
    const post_date = {
	  "natural_month_sign": {
		"agentType": "1",
		"agentversion": "1",
		"authCookie": P00001,
		"qyid": md5(stringRandom(16)),
		"taskCode": "iQIYI_mofhr",
		"verticalCode": "iQIYI"
      }
    };
    const sign = k("UKobMjDMsDoScuWOfp6F", sign_date, {
      split: "|",
      sort: !0,
      splitSecretKey: !0
    });
    var URL = {
      url: 'https://community.iqiyi.com/openApi/task/execute?' + w(sign_date) + "&sign=" + sign,
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify(post_date)
    }
    $nobyda.post(URL, function(error, response, data) {
      if (error) {
        $nobyda.data = "签到失败: 接口请求出错 ‼️"
        console.log(`爱奇艺-${$nobyda.data} ${error}`)
      } else {
        if(!isJSON_test(data)){
          return false;
        }
        const obj = JSON.parse(data)
        const Details = LogDetails ? `response:\n${data}` : ''
        if (obj.code === "A00000") {
          if (obj.data.code === "A0000") {
            var quantity = obj.data.data.rewards[0].rewardCount;
            var continued = obj.data.data.signDays;
            $nobyda.data = "签到成功: 获得积分" + quantity + ", 累计签到" + continued + "天 🎉"
            console.log(`爱奇艺-${$nobyda.data} ${Details}`)
          } else {
            $nobyda.data = "签到失败: " + obj.data.msg + " ⚠️"
            console.log(`爱奇艺-${$nobyda.data} ${Details}`)
          }
        } else {
          $nobyda.data = "签到失败: Cookie无效 ⚠️"
          console.log(`爱奇艺-${$nobyda.data} ${Details}`)
        }
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function WebCheckin() {
  return new Promise(resolve => {
    const web_sign_date = {
      agenttype: "1",
      agentversion: "0",
      appKey: "basic_pca",
      appver: "0",
      authCookie: P00001,
      channelCode: "sign_pcw",
      dfp: dfp,
      scoreType: "1",
      srcplatform: "1",
      typeCode: "point",
      userId: P00003,
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
      verticalCode: "iQIYI"
    };

    const sign = k("DO58SzN6ip9nbJ4QkM8H", web_sign_date, {
      split: "|",
      sort: !0,
      splitSecretKey: !0
    });
    var URL = {
      url: 'https://community.iqiyi.com/openApi/score/add?' + w(web_sign_date) + "&sign=" + sign
    }
    $nobyda.get(URL, function(error, response, data) {
      if (error) {
        $nobyda.data = "网页端签到失败: 接口请求出错 ‼️"
        console.log(`爱奇艺-${$nobyda.data} ${error}`)
      } else {
        if(!isJSON_test(data)){
          return false;
        }
        const obj = JSON.parse(data)
        const Details = LogDetails ? `response:\n${data}` : ''
        if (obj.code === "A00000") {
          if (obj.data[0].code === "A0000") {
            var quantity = obj.data[0].score;
            var continued = obj.data[0].continuousValue;
            $nobyda.data = "网页端签到成功: 获得积分" + quantity + ", 累计签到" + continued + "天 🎉"
            console.log(`爱奇艺-${$nobyda.data} ${Details}`)
          } else {
            $nobyda.data = "网页端签到失败: " + obj.data[0].message + " ⚠️"
            console.log(`爱奇艺-${$nobyda.data} ${Details}`)
          }
        } else {
          $nobyda.data = "网页端签到失败: Cookie无效 ⚠️"
          console.log(`爱奇艺-${$nobyda.data} ${Details}`)
        }
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function Lottery(s) {
  return new Promise(resolve => {
    $nobyda.times++
      const URL = {
        url: 'https://iface2.iqiyi.com/aggregate/3.0/lottery_activity?app_k=0&app_v=0&platform_id=0&dev_os=0&dev_ua=0&net_sts=0&qyid=0&psp_uid=0&psp_cki=' + P00001 + '&psp_status=0&secure_p=0&secure_v=0&req_sn=0'
      }
    setTimeout(() => {
      $nobyda.get(URL, async function(error, response, data) {
        if (error) {
          $nobyda.data += "\n抽奖失败: 接口请求出错 ‼️"
          console.log(`爱奇艺-抽奖失败: 接口请求出错 ‼️ ${error} (${$nobyda.times})`)
          //$nobyda.notify("爱奇艺", "", $nobyda.data)
        } else {
          const obj = JSON.parse(data);
          const Details = LogDetails ? `response:\n${data}` : ''
          $nobyda.last = !!data.match(/(机会|已经)用完/)
          if (obj.awardName && obj.code === 0) {
            $nobyda.data += !$nobyda.last ? `\n抽奖成功: ${obj.awardName.replace(/《.+》/, "未中奖")} 🎉` : `\n抽奖失败: 今日已抽奖 ⚠️`
            console.log(`爱奇艺-抽奖明细: ${obj.awardName.replace(/《.+》/, "未中奖")} 🎉 (${$nobyda.times}) ${Details}`)
          } else if (data.match(/\"errorReason\"/)) {
            const msg = data.match(/msg=.+?\)/) ? data.match(/msg=(.+?)\)/)[1].replace(/用户(未登录|不存在)/, "Cookie无效") : ""
            $nobyda.data += `\n抽奖失败: ${msg || `未知错误 Cookie疑似失效`} ⚠️`
            console.log(`爱奇艺-抽奖失败: ${msg || `未知错误 Cookie疑似失效`} ⚠️ (${$nobyda.times}) ${msg ? Details : `response:\n${data}`}`)
            console.log(data)
            s = s + 500;
            if(s <= 4500){
              await Lottery(s)
            }
          } else {
            $nobyda.data += "\n抽奖错误: 已输出日志 ⚠️"
            console.log(`爱奇艺-抽奖失败: \n${data} (${$nobyda.times})`)
          }
        }
        if (!$nobyda.last && $nobyda.times < 3) {
          await Lottery(s)
        } else {
          const expires = $nobyda.expire ? $nobyda.expire.replace(/\u5230\u671f/, "") : "获取失败 ⚠️"
          if (!$nobyda.isNode) $nobyda.notify("爱奇艺", "到期时间: " + expires, $nobyda.data);
        }
        resolve()
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  })
}

function joinTask(task) {
  return new Promise(resolve => {
    $nobyda.get('https://tc.vip.iqiyi.com/taskCenter/task/joinTask?taskCode=' + task + '&lang=zh_CN&platform=0000000000000000&P00001=' + P00001, function (error, response, data) {resolve()})
    if (out) setTimeout(resolve, out)
  })
}

function notifyTask(task) {
  return new Promise(resolve => {
    $nobyda.get('https://tc.vip.iqiyi.com/taskCenter/task/notify?taskCode=' + task + '&lang=zh_CN&platform=0000000000000000&P00001=' + P00001, function (error, response, data) {resolve()})
    if (out) setTimeout(resolve, out)
  })
}

function getTaskRewards(task) {
  return new Promise(resolve => {
    $nobyda.get('https://tc.vip.iqiyi.com/taskCenter/task/getTaskRewards?taskCode=' + task + '&lang=zh_CN&platform=0000000000000000&P00001=' + P00001, function (error, response, data) {
      if (error) {
        $nobyda.data += "\n浏览奖励失败: 接口请求出错 ‼️"
        console.log(`爱奇艺-抽奖失败: \n${data} (${$nobyda.times})`)
      } else {
        const obj = JSON.parse(data)
        const Details = LogDetails ? `response:\n${data}` : ''
        if (obj.msg === "成功") {
          if (obj.code === "A00000") {
            if(obj.dataNew[0] !== undefined){ //任务未完成
              $nobyda.data += `\n浏览奖励成功: ${obj.dataNew[0].name + obj.dataNew[0].value} 🎉`
              console.log(`爱奇艺-浏览奖励成功: ${obj.dataNew[0].name + obj.dataNew[0].value} 🎉`)
            }
          } else {
            $nobyda.data += `\n浏览奖励失败: ${obj.msg} ⚠️`
            console.log(`爱奇艺-抽奖失败: ${obj.msg || `未知错误`} ⚠️ (${$nobyda.times}) ${msg ? Details : `response:\n${data}`}`)
          }
        } else {
          $nobyda.data += "\n浏览奖励失败: Cookie无效/接口失效 ⚠️"
          console.log(`爱奇艺-浏览奖励失败: \n${data}`)
        }
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  })
}

function nobyda() {
  const times = 0
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const node = (() => {
    if (isNode) {
      const request = require('request');
      return ({
        request
      })
    } else {
      return null
    }
  })()
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message)
    if (isSurge) $notification.post(title, subtitle, message)
    if (isNode) log('\n' + title + '\n' + subtitle + '\n' + message)
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) $httpClient.get(options, (error, response, body) => {
      callback(error, adapterStatus(response), body)
    })
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }

  const log = (message) => console.log(message)
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    isRequest,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    log,
    time,
    times,
    done
  }
};

function isJSON_test(str) {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            //console.log('转换成功：'+obj);
            return true;
        } catch(e) {
            console.log('no json');
            console.log('error：'+str+'!!!'+e);
            return false;
        }
    }
    //console.log('It is not a string!')
}

function k(e, t) {
  var a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
    , n = a.split
    , c = void 0 === n ? "|" : n
    , r = a.sort
    , s = void 0 === r || r
    , o = a.splitSecretKey
    , i = void 0 !== o && o
    , l = s ? Object.keys(t).sort() : Object.keys(t)
    , u = l.map((function (e) {
      return "".concat(e, "=").concat(t[e])
    }
    )).join(c) + (i ? c : "") + e;
  return md5(u)
}
function md5(date){
  const crypto = require('crypto');
  return crypto.createHash("md5").update(date, "utf8").digest("hex")
}
function w(){
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    , t = [];
  return Object.keys(e).forEach((function (a) {
    t.push("".concat(a, "=").concat(e[a]))
  }
  )),
    t.join("&")
}
