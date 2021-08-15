const { App } = require('@slack/bolt');
require('dotenv').config();
const mysql = require('mysql');
const fetch = require("node-fetch");
const botChannel = 'CQFAH9M8V'
const testChannel = 'C02BKMY8NEL'

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
  
const conn = mysql.createConnection({
  host: "localhost", 
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD
});
conn.connect();

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
      conn.query(sql);
      fetch("https://preprep.slack.com/api/chat.postMessage", {
        "headers": {
          "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOAsQC0yidS97iFh1",
        },
        "body": `------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${process.env.SLACK_BOT_TOKEN}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n${message.channel}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"thread_ts\"\r\n\r\n${message.ts}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n${blocks}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1--\r\n`,
        "method": "POST",
      }).then(r => r.text()).then(r => console.log(r))
    }
});

app.message('', async ({ message, say }) => {
    if ((message.channel == botChannel || message.channel == testChannel) &&
        message.type == "message" &&
        message.thread_ts == undefined && 
        message.subtype == undefined) {
            let blocks = `[
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "<@${message.user}> Оформи, пожалуйста, обращение по форме. Подробнее <https://preprep.slack.com/archives/CQFAH9M8V/p1623737987008600|в треде>"
                    }
                }
            ]`
            fetch("https://preprep.slack.com/api/chat.postMessage", {
              "headers": {
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOAsQC0yidS97iFh1",
              },
              "body": `------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${process.env.SLACK_BOT_TOKEN}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n${message.channel}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"thread_ts\"\r\n\r\n${message.ts}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n${blocks}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1--\r\n`,
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
    let sql = `INSERT INTO \`bughunter_threads_actions\` VALUES ('${body.message.thread_ts}','${body.actions[0].action_id}','${body.actions[0].action_ts}')`
    conn.query(sql);
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
        "body": `------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n${process.env.SLACK_BOT_TOKEN}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n${channel}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"thread_ts\"\r\n\r\n${thread_ts}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n${newCsatBlock}\r\n------WebKitFormBoundaryOAsQC0yidS97iFh1--\r\n`,
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
            "blocks": ${JSON.stringify(body.message.blocks)}
            }`,
        method: "POST"
      })
        .then(r => r.text())
        .then(r => console.log(r))
}

app.action('eyes', async ({ body, ack }) => {
    await ack();
    insertBughunterThreadsAction(body)
    body.message.blocks[0].text.text += `\n${getCurTime()} :eyes: - Взял в работу <@${body.user.id}>`;
    body.message.blocks[1] = JSON.parse(afterEyeBlock)
    let sql = `UPDATE \`bughunter_threads\` SET \`first\`='${body.actions[0].action_ts}',\`user\`='${body.user.id}' WHERE \`ts\`=${body.message.thread_ts}`
    conn.query(sql);
    sendResponse(body)
})
app.action('hourglass_flowing_sand', async ({ body, ack }) => {
    await ack();
    insertBughunterThreadsAction(body)
    body.message.blocks[0].text.text += `\n${getCurTime()} :hourglass_flowing_sand: - Обращение в ожидании <@${body.user.id}>`;
    body.message.blocks[1] = JSON.parse(waiting)
    sendResponse(body)
})
app.action('ladybug', async ({ body, ack }) => {
    await ack();
    insertBughunterThreadsAction(body)
    body.message.blocks[0].text.text += `\n${getCurTime()} :ladybug: - Баг передан в разработку <@${body.user.id}>`;
    body.message.blocks[1] = JSON.parse(waiting)
    sendResponse(body)
})
app.action('ahhh', async ({ body, ack }) => {
    await ack();
    insertBughunterThreadsAction(body)
    body.message.blocks[0].text.text += `\n${getCurTime()} :ahhh: - Много обращений, ответ займет больше времени <@${body.user.id}>`;
    body.message.blocks[1] = JSON.parse(waiting)
    sendResponse(body)
})
app.action('bowl_with_spoon', async ({ body, ack }) => {
    await ack();
    insertBughunterThreadsAction(body)
    body.message.blocks[0].text.text += `\n${getCurTime()} :bowl_with_spoon: - На обеде/приоритетных задачх, ответ будет позже <@${body.user.id}>`;
    body.message.blocks[1] = JSON.parse(waiting)
    sendResponse(body)
})
app.action('arrow_forward', async ({ body, ack }) => {
    await ack();
    insertBughunterThreadsAction(body)
    body.message.blocks[0].text.text += `\n${getCurTime()} :arrow_forward: - Работа над обращением продолжена <@${body.user.id}>`;
    body.message.blocks[1] = JSON.parse(afterEyeBlock)
    sendResponse(body)
})
app.action('heavy_check_mark', async ({ body, ack }) => {
    await ack();
    insertBughunterThreadsAction(body)

    body.message.blocks[0].text.text += `\n${getCurTime()} :heavy_check_mark: - Работа с обращением завершена <@${body.user.id}>`;
    body.message.blocks.splice(1, 1)
    let sql = `UPDATE \`bughunter_threads\` SET \`last\`=${body.actions[0].action_ts} WHERE \`ts\`=${body.message.thread_ts}`
    conn.query(sql);
    req_csat(body.message.thread_ts, body.channel.id)

    sendResponse(body)
})

app.action('one', async ({ body, ack }) => {
   await ack();
   let requestor = ''
   let sql = `SELECT \`requestor\` FROM \`bughunter_threads\` WHERE \`ts\`='${body.message.thread_ts}'`
    conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      requestor = result[0].requestor
      
      if(requestor != body.user.id) {
    	body.message.blocks[0].text.text += `\n<@${body.user.id}> Оценить работу может только обратившийся`
      } else {
        let csat = 1
        let sql = `UPDATE \`bughunter_threads\` SET \`csat\`=${csat} WHERE \`ts\`=${body.message.thread_ts}`
        conn.query(sql);
        body.message.blocks[0].text.text = `<@${body.user.id}> Спасибо за оценку!`
        body.message.blocks.splice(1, 1)
      }
      sendResponse(body)
    })
})
app.action('two', async ({ body, ack }) => {
   await ack();
   let requestor = ''
   let sql = `SELECT \`requestor\` FROM \`bughunter_threads\` WHERE \`ts\`='${body.message.thread_ts}'`
    conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      requestor = result[0].requestor
      
      if(requestor != body.user.id) {
    	body.message.blocks[0].text.text += `\n<@${body.user.id}> Оценить работу может только обратившийся`
      } else {
        let csat = 2
        let sql = `UPDATE \`bughunter_threads\` SET \`csat\`=${csat} WHERE \`ts\`=${body.message.thread_ts}`
        conn.query(sql);
        body.message.blocks[0].text.text = `<@${body.user.id}> Спасибо за оценку!`
        body.message.blocks.splice(1, 1)
      }
      sendResponse(body)
    })
})
app.action('three', async ({ body, ack }) => {
   await ack();
   let requestor = ''
   let sql = `SELECT \`requestor\` FROM \`bughunter_threads\` WHERE \`ts\`='${body.message.thread_ts}'`
    conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      requestor = result[0].requestor
      
      if(requestor != body.user.id) {
    	body.message.blocks[0].text.text += `\n<@${body.user.id}> Оценить работу может только обратившийся`
      } else {
        let csat = 3
        let sql = `UPDATE \`bughunter_threads\` SET \`csat\`=${csat} WHERE \`ts\`=${body.message.thread_ts}`
        conn.query(sql);
        body.message.blocks[0].text.text = `<@${body.user.id}> Спасибо за оценку!`
        body.message.blocks.splice(1, 1)
      }
      sendResponse(body)
    })
})
app.action('four', async ({ body, ack }) => {
   await ack();
   let requestor = ''
   let sql = `SELECT \`requestor\` FROM \`bughunter_threads\` WHERE \`ts\`='${body.message.thread_ts}'`
    conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      requestor = result[0].requestor
      
      if(requestor != body.user.id) {
    	body.message.blocks[0].text.text += `\n<@${body.user.id}> Оценить работу может только обратившийся`
      } else {
        let csat = 4
        let sql = `UPDATE \`bughunter_threads\` SET \`csat\`=${csat} WHERE \`ts\`=${body.message.thread_ts}`
        conn.query(sql);
        body.message.blocks[0].text.text = `<@${body.user.id}> Спасибо за оценку!`
        body.message.blocks.splice(1, 1)
      }
      sendResponse(body)
    })
})
app.action('five', async ({ body, ack }) => {
   await ack();
   let requestor = ''
   let sql = `SELECT \`requestor\` FROM \`bughunter_threads\` WHERE \`ts\`='${body.message.thread_ts}'`
    conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      requestor = result[0].requestor
      
      if(requestor != body.user.id) {
    	body.message.blocks[0].text.text += `\n<@${body.user.id}> Оценить работу может только обратившийся`
      } else {
        let csat = 5
        let sql = `UPDATE \`bughunter_threads\` SET \`csat\`=${csat} WHERE \`ts\`=${body.message.thread_ts}`
        conn.query(sql);
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

app.event('goodbye', async () => {
  console.log('⚡️ Goodbye event!');
  await app.start(process.env.PORT || 3000);
})

app.event('challenge', async () => {
  console.log('⚡️ Goodbye event!');
  await app.start(process.env.PORT || 3000);
})