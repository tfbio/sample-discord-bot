require('dotenv').config()

const MusicPlayer = require('./MusicPlayer')
const { voiceChannelConnection } = require('./voiceChannelConnection')
const { ERROR_UNKNOWN_COMMAND, HELP_COMMANDS } = require('./messages')
const { listAllPlaylists, listPlaylistMusics, runPlaylist, createPlaylist, addMusicToPlaylist, deletePlaylist } = require('./playlistRoutines')
const { Client, Intents } = require('discord.js')


const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_VOICE_STATES
] })


let clientLogged = false
client.once('ready', () => { 
  console.log(`${client.user.tag} logged in.`)
  clientLogged = true;
})

const CLIENT_PLAYER = new MusicPlayer()

client.on('messageCreate', async message => {
  if(message.author.bot) return
  if(!message.content.startsWith('!')) return

  const content = message.content.toLowerCase().slice(1).split(' ')
  const command = content[0]

  switch (command) {
    case 'connect':
      voiceChannelConnection(message, CLIENT_PLAYER)
      break

    case 'list':
      CLIENT_PLAYER.showQueue(message)
      break  
    
    case 'play':
      await CLIENT_PLAYER.playMusicRoutine(message)
      break
      
    case 'next':
      CLIENT_PLAYER.playNextSong(message)
      break
    
    case 'pause':
      CLIENT_PLAYER.pause()
      break

    case 'resume':
      CLIENT_PLAYER.resume()
      break

    case 'stop':
      CLIENT_PLAYER.stop()
      break

    case 'remove':
      CLIENT_PLAYER.remove()
      break
    
    case 'pl-play':
      runPlaylist(message, CLIENT_PLAYER)
      break
      
    case 'pl-list':
      listAllPlaylists(message)
      break

    case 'pl-show':
      listPlaylistMusics(message)
      break
    
    case 'pl-new':
      createPlaylist(message)
      break
    
    case 'pl-add':
      addMusicToPlaylist(message)
      break  

    case 'pl-delete':
      deletePlaylist(message)
      break 

    case 'help':
      message.channel.send(HELP_COMMANDS)
      break 

    default:
      message.channel.send(ERROR_UNKNOWN_COMMAND)
      break 
  }
})

client.on('error', error => {
  console.error('Client encountered an error:', error);
})

if(!clientLogged) client.login(process.env.TOKEN)

