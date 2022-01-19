/*
爱奇艺会员签到脚本
更新时间: 2022.1.19
脚本兼容: QuantumultX, Surge4, Loon, JsBox, Node.js
电报频道: @NobyDa
问题反馈: @NobyDa_bot
获取Cookie说明：
打开爱奇艺App后(AppStore中国区)，点击"我的", 如通知成功获取cookie, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9:00执行, 您可以修改执行时间。
如果使用Node.js, 需自行安装'request'模块. 例: npm install request -g
JsBox, Node.js用户抓取Cookie说明：
开启抓包, 打开爱奇艺App后(AppStore中国区)，点击"我的" 返回抓包App 搜索请求头关键字 将cookie全部字段写入cookie
提取字母数字混合字段, 到&结束, 填入以下单引号内即可.
*/

var cookie = ''
if(cookie){
  var dfp = cookie.match(/__dfp=(.*?)@/)[1]
  var P00001 = cookie.match(/P00001=(.*?);/)[1]
  var P00003 = cookie.match(/P00003=(.*?);/)[1]
}


/*********************
 QuantumultX 远程脚本配置:
 **********************
 [task_local]
 # 爱奇艺会员签到
 0 9 * * * https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js
 [rewrite_local]
 # 获取Cookie
 ^https?:\/\/iface(\d)?\.iqiyi\.com\/ url script-request-header https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js
 [mitm]
 hostname= ifac*.iqiyi.com
 **********************
 Surge 4.2.0+ 脚本配置:
 **********************
 [Script]
 爱奇艺签到 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js
 爱奇艺获取Cookie = type=http-request,pattern=^https?:\/\/iface(\d)?\.iqiyi\.com\/,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js
 [MITM]
 hostname= ifac*.iqiyi.com
 ************************
 Loon 2.1.0+ 脚本配置:
 ************************
 [Script]
 # 爱奇艺签到
 cron "0 9 * * *" script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js
 # 获取Cookie
 http-request ^https?:\/\/iface(\d)?\.iqiyi\.com\/ script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js
 [Mitm]
 hostname= ifac*.iqiyi.com
 */
const LogDetails = false; // 响应日志
const tasks = ['b6e688905d4e7184', 'a7f02e895ccbf416']; //浏览任务号

const out = 10000; // 超时 (毫秒) 如填写, 则不少于3000

var $nobyda = nobyda();

const axios = require('axios');
const crypto = require('crypto');

(async () => {
  if (cookie!== "" && P00001 !== "" && P00003 !== "" && dfp !== "") {
    await login();
    await WebCheckin();
    await Lottery(500);
    await $nobyda.time();
    for (let i = 0; i < tasks.length; i++){
      await joinTask(tasks[i]);
      await notifyTask(tasks[i]);
      await new Promise(r => setTimeout(r, 5000));
      await getTaskRewards(tasks[i]);
    }
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
      url: 'https://cards.iqiyi.com/views_category/3.0/vip_home?secure_p=iPhone&scrn_scale=0&dev_os=0&ouid=0&layout_v=6&psp_cki=' + P00001 + '&page_st=suggest&app_k=8e48946f144759d86a50075555fd5862&dev_ua=iPhone8%2C2&net_sts=1&cupid_uid=0&xas=1&init_type=6&app_v=11.4.5&idfa=0&app_t=0&platform_id=0&layout_name=0&req_sn=0&api_v=0&psp_status=0&psp_uid=451953037415627&qyid=0&secure_v=0&req_times=0',
      headers: {
        sign: '7fd8aadd90f4cfc99a858a4b087bcc3a',
        t: '479112291'
      }
    }
    $nobyda.get(URL, function(error, response, data) {
      const Details = LogDetails ? data ? `response:\n${data}` : '' : ''
      if (!error && data.match(/\"text\":\"\d.+?\u5230\u671f\"/)) {
        $nobyda.expire = data.match(/\"text\":\"(\d.+?\u5230\u671f)\"/)[1]
        console.log(`爱奇艺-查询成功: ${$nobyda.expire} ${Details}`)
      } else {
        console.log(`爱奇艺-查询失败${error || ': 无到期数据 ⚠️'} ${Details}`)
      }
      resolve()
    })
    if (out) setTimeout(resolve, out)
  })
}

function WebCheckin() {
  return new Promise(resolve => {
    var str = "agenttype=1|agentversion=0|appKey=basic_pca|appver=0|authCookie=" + P00001 + "|channelCode=sign_pcw|dfp=" + dfp + "|scoreType=1|srcplatform=1|typeCode=point|userId=" + P00003 + "|user_agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36|verticalCode=iQIYI|DO58SzN6ip9nbJ4QkM8H"
    var sign = crypto.createHash('md5').update(str).digest("hex")
    var URL = {
      url: 'https://community.iqiyi.com/openApi/score/add?agenttype=1&agentversion=0&appKey=basic_pca&appver=0&authCookie=' + P00001 + "&channelCode=sign_pcw&dfp=" + dfp +"&scoreType=1&srcplatform=1&typeCode=point&userId=" + P00003 + "&user_agent=Mozilla/5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/97.0.4692.71%20Safari/537.36&verticalCode=iQIYI&sign=" + sign
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
          $nobyda.data = "签到失败: Cookie无效 ⚠️"
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
            $nobyda.data += `\n浏览奖励成功: ${obj.dataNew[0].name + obj.dataNew[0].value} 🎉`
            console.log(`爱奇艺-浏览奖励成功: ${obj.dataNew[0].name + obj.dataNew[0].value} 🎉`)
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
      return (null)
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
