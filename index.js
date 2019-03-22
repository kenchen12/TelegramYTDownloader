const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const readline = require('readline');
const ytdl     = require('ytdl-core');
const ffmpeg   = require('fluent-ffmpeg');
var name = ''
function getName(link){
	return new Promise (function(resolve, reject){
		var HTMLParser = require ('node-html-parser');

		var request = require('request');
		request(link,              
			function (error, response, body){
				const root = HTMLParser.parse(body)
				resolve(root.querySelector('title').rawText)
			}
		)

	})
}
function download(id){
	return new Promise (async function (resolve, reject){
		name = await getName(id)
		name = name.substr(0, name.length-10)
		console.log(name)
		let stream = ytdl(id, {
			quality: 'highestaudio',
			//filter: 'audioonly',
		});
		let start = Date.now();
		ffmpeg(stream)
			.audioBitrate(192)
			.save(name + '.mp3')
			.on('end', () => {
				resolve()
			});
	})
}
const bot = new Telegraf(process.env.BOT_TOKEN)
const telegram = new Telegram(process.env.BOT_TOKEN)
bot.command('download', (ctx) => {
	let link = ctx.message.text
	link = link.substr(10)
	console.log(link)
	telegram.sendMessage(ctx.message.chat.id, 'Baixando').then(
		()=>{return download(link)}
	).catch(()=>{})
	.then(
		async ()=>{
			return telegram.sendAudio(ctx.message.chat.id,{source: './' + name + '.mp3'})
		}
	)
	.catch(()=>{})
	.then()
	.catch()
//	telegram.sendMessage(ctx.message.chat.id, 'Baixado')
//	telegram.sendMessage(ctx.message.chat.id, 'pronto')
})
bot.launch()

bot.start((ctx) => ctx.reply('Welcome! To download the audio from a youtube video send /download (youtube link)'))
/*bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()
*/
