require('dotenv').config()

const { 
  createAudioPlayer,
  joinVoiceChannel
} = require('@discordjs/voice')
const Spotify = require('spotifydl-core').default

module.exports.voiceChannelConnection = function(message, CLIENT_PLAYER) {
  const channelId = message.member.voice.channel.id
  const guildId = message.member.guild.id
  const adapterCreator = message.member.guild.voiceAdapterCreator
  const voiceChannel = message.member.voice.channel
  const permissions = voiceChannel.permissionsFor(message.client.user)
  
  
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    console.log('Not permission to use this channel')
    return
  } 

  if(CLIENT_PLAYER.musicPlayer === null) CLIENT_PLAYER.musicPlayer = createAudioPlayer()

  if(CLIENT_PLAYER.connection === null) {
    CLIENT_PLAYER.connection = joinVoiceChannel({ channelId, guildId, adapterCreator }) 
  } else {
    CLIENT_PLAYER.connection.destroy()
    CLIENT_PLAYER.connection = joinVoiceChannel({ channelId, guildId, adapterCreator })
  }

  if(CLIENT_PLAYER.subscription) {
    CLIENT_PLAYER.subscription = CLIENT_PLAYER.connection.subscribe(CLIENT_PLAYER.musicPlayer)
  }
  while(CLIENT_PLAYER.subscription === null) {
    CLIENT_PLAYER.subscription = CLIENT_PLAYER.connection.subscribe(CLIENT_PLAYER.musicPlayer)
  }
  
  if(CLIENT_PLAYER.spotify == null) {
    const credentials = {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    }
    CLIENT_PLAYER.spotify = new Spotify(credentials)
  }

  if(CLIENT_PLAYER.playerSetted === false) CLIENT_PLAYER.initPlayerStatesHandler(message)
}