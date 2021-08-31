const { App } = require('@slack/bolt');
require('dotenv').config();
const mysql = require('mysql');
const fetch = require("node-fetch");
const botChannel = 'CQFAH9M8V'
const testChannel = 'C02BKMY8NEL'

const fs = require("fs");
var util = require('util');
var log_file = fs.createWriteStream('./logs/app.log', {flags:'a'})
console.log = function(d) { 
  log_file.write(util.format(d) + '\n');
};

const start_block = `[
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Обращение принято"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": ":eyes:"
          },
          "action_id": "eyes"
        }
      ]
    }
  ]`
const afterEyeBlock = `{
    "type": "actions",
    "elements": [
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": ":hourglass_flowing_sand:"
            },
            "action_id": "hourglass_flowing_sand"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": ":ladybug:"
            },
            "action_id": "ladybug"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": ":ahhh:"
            },
            "action_id": "ahhh"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": ":bowl_with_spoon:"
            },
            "action_id": "bowl_with_spoon"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": ":heavy_check_mark:"
            },
            "action_id": "heavy_check_mark"
        }
    ]
}`

const waiting = `{
    "type": "actions",
    "elements": [
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": ":arrow_forward:"
            },
            "action_id": "arrow_forward"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": ":heavy_check_mark:"
            },
            "action_id": "heavy_check_mark"
        }
    ]
}`

const csat_blocks = `[
{
    "type": "section",
    "text": {
        "type": "mrkdwn",
        "text": "Оцени, пожалуйста, работу над обращением"
    }
},
{
    "type": "actions",
    "elements": [
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "1"
            },
            "action_id": "one"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "2"
            },
            "action_id": "two"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "3"
            },
            "action_id": "three"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "4"
            },
            "action_id": "four"
        },
        {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "5"
            },
            "action_id": "five"
        }
    ]
}
]`
  
const conn = mysql.createPool({
  host: "localhost", 
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.message('', async ({ message, say }) => {
  if ((message.channel == botChannel || message.channel == testChannel) &&
      message.type == "message" &&
      message.thread_ts == undefined && 
      message.subtype == "bot_message") {
    console.log(message)
    let requestor = ''
    try {
      requestor = message.text.match(/<@(.*?)>/)[1]
    } catch (error) {
      console.error(error);
    }
    let blocks = start_block
    let sql = `INSERT INTO \`bughunter_threads\`(\`ts\`, \`channel\`, \`requestor\`) VALUES ('${message.ts}', '${message.channel}', '${requestor}')`
    conn.query(sql, function(err, results) {
      if(err) console.log(err);
      else console.log(results);
    });
    fetch("https://preprep.slack.com/api/chat.postMessage", {
      "headers": {
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOAsQC0yidS97iFh1",
      },
      "body": `------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${process.env.SLACK_BOT_TOKEN}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n${message.channel}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"thread_ts\"\r\n\r\n${message.ts}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n${blocks}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nОбращение принято, скоро его возьмут в работу\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\n`,
      "method": "POST",
    }).then(r => r.text()).then(r => console.log(r))
  } else if ((message.channel == botChannel || message.channel == testChannel) &&
      message.type == "message" &&
      message.thread_ts == undefined && 
      (message.subtype == undefined || message.subtype == "file_share")) {
    let blocks = `[
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "<@${message.user}> Оформи, пожалуйста, обращение по форме. Подробнее <https://preprep.slack.com/archives/CQFAH9M8V/p1623737987008600|в треде>"
			}
		},
		{
			"type": "image",
			"image_url": "http://dl3.joxi.net/drive/2021/08/24/0040/2524/2640348/48/2fbf8dee41.png",
			"alt_text": "marg"
		}
	]`
    fetch("https://preprep.slack.com/api/chat.postMessage", {
      "headers": {
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOAsQC0yidS97iFh1",
      },
      "body": `------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${process.env.SLACK_BOT_TOKEN}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n${message.channel}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"thread_ts\"\r\n\r\n${message.ts}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n${blocks}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nОбращение оформлено неверно, оно будет проигнорировано. Пожалуйста, переоформи обращение.\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\n`,
      "method": "POST",
    }).then(r => r.text()).then(r => console.log(r))
  }
});

function getCurTime() {
  let curTime = new Date();
  curTime = curTime.toLocaleString('ru', {hour: 'numeric', minute: 'numeric', second:'numeric'})
  return curTime
}

function insertBughunterThreadsAction(body) {
  console.log(body)
  let sql = `INSERT INTO \`bughunter_threads_actions\` VALUES ('${body.message.thread_ts}','${body.actions[0].action_id}','${body.actions[0].action_ts}')`
  conn.query(sql, function(err, results) {
    if(err) console.log(err);
    else console.log(results);
  });
}

function req_csat(thread_ts, channel) {
  let requestor = ''
  let sql = `SELECT \`requestor\` FROM \`bughunter_threads\` WHERE \`ts\`='${thread_ts}'`
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    requestor = result[0].requestor
    let newCsatBlock = JSON.parse(csat_blocks)
    console.log(requestor)
    if(requestor != '') {
      newCsatBlock[0].text.text = `<@${requestor}> оцени, пожалуйста, работу над обращением`
      newCsatBlock = JSON.stringify(newCsatBlock)
    } else {
      newCsatBlock = csat_blocks
    }
    fetch("https://preprep.slack.com/api/chat.postMessage", {
      "headers": {
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOAsQC0yidS97iFh1",
      },
      "body": `------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${process.env.SLACK_BOT_TOKEN}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n${channel}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"thread_ts\"\r\n\r\n${thread_ts}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n${newCsatBlock}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"text\"\r\n\r\nОцени, пожалуйста, работу багхантера над обращением\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\n`,
      "method": "POST",
    }).then(r => r.json).then(r => {if(r.ok) console.log('csat_ok')})
  });
}

function sendResponse(body){
  fetch(body.response_url, {
    headers: {
      "content-type": "application/json"
    },
    body: `{
      "text": ${JSON.stringify(body.message.text)},
"blocks": ${JSON.stringify(body.message.blocks)}
}`,
    method: "POST"
  })
    .then(r => r.text())
    .then(r => console.log(r))
}
app.action(/(eyes|hourglass_flowing_sand|ladybug|ahhh|bowl_with_spoon|arrow_forward|heavy_check_mark)/, async ({ context, body, ack }) => {
  await ack();
  console.log(context.actionIdMatches[0])
  const action = context.actionIdMatches[0]
  let sql = `SELECT * FROM \`bughunter_threads_actions\` WHERE \`thread_ts\`='${body.message.thread_ts}' ORDER BY \`action_ts\` DESC LIMIT 1`
  conn.query(sql, function(err, results) {
    if(err) console.log(err);
    else console.log(results);
    if(results[0] == undefined || body.actions[0].action_ts - results[0].action_ts > 2) {
      insertBughunterThreadsAction(body)
      switch(action) {
        case('eyes'):
          eyes(body)
          break
        case('hourglass_flowing_sand'):
          hourglass_flowing_sand(body)
          break
        case('ladybug'):
          ladybug(body)
          break
        case('ahhh'):
          ahhh(body)
          break
        case('bowl_with_spoon'):
          bowl_with_spoon(body)
          break
        case('arrow_forward'):
          arrow_forward(body)  
          break
        case('heavy_check_mark'):
          heavy_check_mark(body)
          break
      }
    }
  })
})
function eyes(body) {
  body.message.blocks[0].text.text += `\n${getCurTime()} :eyes: - Взял в работу <@${body.user.id}>`;
  body.message.blocks[1] = JSON.parse(afterEyeBlock)
  sendResponse(body)
  let sql = `UPDATE \`bughunter_threads\` SET \`first\`='${body.actions[0].action_ts}',\`user\`='${body.user.id}' WHERE \`ts\`=${body.message.thread_ts}`
  conn.query(sql, function(err, results) {
    if(err) console.log(err);
    else console.log(results);
  });
}
function hourglass_flowing_sand(body) {
  body.message.blocks[0].text.text += `\n${getCurTime()} :hourglass_flowing_sand: - Обращение в ожидании <@${body.user.id}>`;
  body.message.blocks[1] = JSON.parse(waiting)
  sendResponse(body)
}
function ladybug(body) {
  body.message.blocks[0].text.text += `\n${getCurTime()} :ladybug: - Баг передан в разработку <@${body.user.id}>`;
  body.message.blocks[1] = JSON.parse(waiting)
  sendResponse(body)
}
function ahhh(body) {
  body.message.blocks[0].text.text += `\n${getCurTime()} :ahhh: - Много обращений, ответ займет больше времени <@${body.user.id}>`;
  body.message.blocks[1] = JSON.parse(waiting)
  sendResponse(body)
}
function bowl_with_spoon(body) {
  body.message.blocks[0].text.text += `\n${getCurTime()} :bowl_with_spoon: - На обеде/приоритетных задачх, ответ будет позже <@${body.user.id}>`;
  body.message.blocks[1] = JSON.parse(waiting)
  sendResponse(body)
}
function arrow_forward(body) {
  body.message.blocks[0].text.text += `\n${getCurTime()} :arrow_forward: - Работа над обращением продолжена <@${body.user.id}>`;
  body.message.blocks[1] = JSON.parse(afterEyeBlock)
  sendResponse(body)
}
function heavy_check_mark(body) {
  body.message.blocks[0].text.text += `\n${getCurTime()} :heavy_check_mark: - Работа с обращением завершена <@${body.user.id}>`;
  body.message.blocks.splice(1, 1)
  sendResponse(body)
  let sql = `UPDATE \`bughunter_threads\` SET \`last\`=${body.actions[0].action_ts} WHERE \`ts\`=${body.message.thread_ts}`
  conn.query(sql, function(err, results) {
    if(err) console.log(err);
    else console.log(results);
  });
  req_csat(body.message.thread_ts, body.channel.id)
}

app.action(/(one|two|three|four|five)/, async ({ context, body, ack }) => {
  await ack();
  const action = context.actionIdMatches[0]
  let csat
  switch(action){
    case('one'):
      csat = 1
      break
    case('two'):
      csat = 2
      break
    case('three'):
      csat = 3
      break
    case('four'):
      csat = 4
      break
    case('five'):
      csat = 5
      break
    default:
      csat = 0
      break
  }
  let requestor = ''
  let sql = `SELECT \`requestor\` FROM \`bughunter_threads\` WHERE \`ts\`='${body.message.thread_ts}'`
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    requestor = result[0].requestor

    if(requestor != body.user.id) {
      body.message.blocks[0].text.text += `\n<@${body.user.id}> Оценить работу может только обратившийся`
    } else {
      let sql = `UPDATE \`bughunter_threads\` SET \`csat\`=${csat} WHERE \`ts\`=${body.message.thread_ts}`
      conn.query(sql, function(err, results) {
        if(err) console.log(err);
        else console.log(results);
      });
      body.message.blocks[0].text.text = `<@${body.user.id}> Спасибо за оценку!`
      body.message.blocks.splice(1, 1)
    }
    sendResponse(body)
  })
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();