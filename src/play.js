const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require("@discordjs/voice");

class Sound {

constructor(){
    this.queue = [];
    this.playing = false;
    this.player = null;
    this.inactivityTimer = null;
    this.minutes = 5;
}

disconnectAfterInactivity(connection) {
    this.inactivityTimer = setTimeout(() => {
        connection.destroy();
    }, this.minutes*60*1000); //5 minutos

}

addQueue(message,song){
    return new Promise((resolve) => {
        this.queue.push(song);
        this.playSound(message, this.queue[0]);
        resolve('Agregado a la queue insta');
    })
}

deleteFirstQueue(){
    this.player.stop();
    this.playing = false;
}

stopAll(){
    this.player.stop();
    this.queue = [];
    this.playing = false;
}

playSound(message,song) {
    if (this.queue.length === 0) {
        this.playing = false;
        return;
    }

    if (!this.playing){
        this.playing = true;
        const voiceChannel = message.member.voice.channel;
        const member = message.member
        if(voiceChannel) {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: member.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });
            const connection = getVoiceConnection(voiceChannel.guild.id);
            this.player = createAudioPlayer();
            const audio = createAudioResource('./audios/' + song + '.mp3');
            this.queue.shift();
            this.player.play(audio);
            connection.subscribe(this.player);
            this.player.on(AudioPlayerStatus.Idle, () => {
                this.playing = false;
                this.playSound(message, this.queue[0]);
            });
        }
    }
    
};


}

const sound = new Sound();

module.exports = sound;