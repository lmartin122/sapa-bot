require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const sound = require('./play');


const prefix = 's!'

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
        Discord.IntentsBitField.Flags.GuildVoiceStates,
    ]
})

client.on('ready', (c) => {
    console.log(` ${c.user.username} is ready`)
    console.log('node version: ' + process.version);
    console.log('discord.js version: ' + Discord.version);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) { return };
    if (message.content.includes(prefix)){
        let args = [];
        let command = message.content.split(prefix)[1].replace(/\s+/g, ' ').trimStart();
        args = command.split(' ');
        command = args.shift();
        if(command.length >= 1){
            readCommand(command,args,message)
                .then( (res) => {
                    message.reply(res)
                })
                .catch((err) => {
                    message.reply(err);
                })
        }
        else {
            message.reply('Y el comando pa?')
        }
    }
    

})

async function readCommand(command,args,message){
    return new Promise(async (resolve, reject) => {
        switch(command){
            case 'help':
                const messageEmbed = new Discord.EmbedBuilder()
                    .setColor(8447003)
                    .setDescription('Hecho por Martin <3')
                    .setTitle('🐸Sapa🐸')
                    .setFields([
                        {
                            name:`${prefix}sounds`,
                            value: 'Muestra los sonidos disponibles'
                        },
                        {
                            name:`${prefix}play <frase>`,
                            value: 'Reproduce el sonido especificado'
                        },
                        {
                            name:`${prefix}skip`,
                            value: 'Deja de reproducir el audio actual'
                        },
                        {
                            name:`${prefix}stop`,
                            value: 'Elimina todos los audios de la queue'
                        }
                    ])
                
                resolve({embeds: [messageEmbed]});
                break;


            case 'play':
                let voiceChannel = message.member.voice.channel;
                const member = message.member;
                if(voiceChannel){
                    if(!fs.existsSync('./audios/' + args[0] + '.mp3')) {
                        reject('No tengo ese audio pa, pasamelo');
                        return;
                    }
                    
                   try {
                       await sound.addQueue(message,args[0])
                           .then( (res) => {
                               resolve(res);
                           })
                           .catch((err) => {
                               console.log(err);
                               reject('error, no tengo idea que pasó xd');
                           })

                   } catch(err) {
                        reject('error, ni idea pa xd')
                   }
                } 
                else {
                    resolve('Metete a un canal perri');
                }
                
                break;

            case 'sounds':
                let audios = [];

                fs.readdir('./audios/', (error, files) => {
                    console.log('archivos: ' + files);
                    files.forEach((file) => {
                        audios.push(file.replace('.mp3', '')); //le saco el .mp3 y los agrego
                    });
                    resolve("Todos estos sonidos se pueden reproducir: " + audios.join(' - '))
                });
                
                break;

            case 'skip':
                sound.deleteFirstQueue();
                resolve("Eliminadoo paaa");
                break;

            case 'stop':
                sound.stopAll();
                resolve("Todo eliminado paaa");
                break;
        }


    });


};


client.login(process.env.TOKEN);