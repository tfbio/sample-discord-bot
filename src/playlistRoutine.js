const { PrismaClient } = require('@prisma/client')
const ytSearch = require('ytsr')
const ytDownload = require('ytdl-core')
const { ERROR_GETTING_PLAYLISTS, ERROR_GETTING_MUSICS, ERROR_CREATING_PLAYLIST, ERROR_BAD_INPUT, ERROR_DB_NO_CONNECTION } = require('./messages')


const prisma = new PrismaClient()


module.exports.listAllPlaylists = async (message) => {
  try {
    const playlists = await prisma.playlist.findMany()
      .catch(e => { message.channel.send(ERROR_GETTING_PLAYLISTS) })
      .finally(async () => { await prisma.$disconnect() })

    const list = playlists.map(playlist => {
      const name = playlist.name
      return `\n - ${name}`
    })
    const discordMessage = list.join(' ')

    if(playlists === []) { message.channel.send('Não encontrei playlists') } 
    else { message.channel.send('Playlists disponíveis: ' + discordMessage) }

  } catch {
    message.channel.send(ERROR_DB_NO_CONNECTION)
  } 
}

module.exports.listPlaylistMusics = async (message) => {
  const playlistName = message.content.substring(8).trimStart()

  if(!playlistName) {
    message.channel.send(ERROR_BAD_INPUT) 
    return
  } 

  try {
    const selectedPlaylist = await prisma.playlist.findFirst({
      where: { name: playlistName },
      include: { tracks: true }
    })
      .catch(e => { message.channel.send(ERROR_GETTING_MUSICS) })
      .finally(async () => { await prisma.$disconnect() })
  
    if(!selectedPlaylist) {
      message.channel.send('Não encontrei a playlist pesquisada')
      return
    } 
  
    const trackIdList = selectedPlaylist.tracks.map(entry => { return entry.trackId })
    const tracksList = await prisma.track.findMany({
      where: { id: { in: trackIdList } }
    })

    const formattedList = tracksList.map(music => {
      const name = music.name
      return `\n - ${name}`
    })
    const discordMessage = formattedList.join(' ')

    message.channel.send(`Playlist ${playlistName}: ${discordMessage}`)   
    
  } catch {
    message.channel.send(ERROR_DB_NO_CONNECTION)
  }  
}

module.exports.runPlaylist = async (message, CLIENT_PLAYER) => {
  const playlistName = message.content.substring(8).trimStart()

  if(!playlistName) {
    message.channel.send(ERROR_BAD_INPUT) 
    return
  } 

  try {
    const selectedPlaylist = await prisma.playlist.findFirst({
      where: { name: playlistName },
      include: { tracks: true }
    })
      .catch(e => { message.channel.send(ERROR_GETTING_MUSICS) })
      .finally(async () => { await prisma.$disconnect() })
  
    if(!selectedPlaylist) {
      message.channel.send('Não encontrei a playlist pesquisada')
      return
    } 
  
    const trackIdList = selectedPlaylist.tracks.map(entry => { return entry.trackId })
    const tracksList = await prisma.track.findMany({
      where: { id: { in: trackIdList } }
    })
    CLIENT_PLAYER.manageCustomPlaylist(tracksList)
  } catch {
    message.channel.send(ERROR_DB_NO_CONNECTION)
  }  
}

module.exports.createPlaylist = async (message) => { // checar ser já existe playlist com esse nome
  const name = message.content.substring(7).trimStart()

  if(!name) {
    message.channel.send(ERROR_BAD_INPUT) 
    return
  } 
  message.channel.send(`Criando nova Playlist ${name}...`)
  
  try {
    await prisma.playlist.create({
      data: {
        name,
      }
    })
      .catch(e => { message.channel.send(ERROR_CREATING_PLAYLIST) })
      .finally(async () => { await prisma.$disconnect() })
  
  } catch {
    message.channel.send(ERROR_DB_NO_CONNECTION)
  } 
}

module.exports.addMusicToPlaylist = async (message) => { //!pl-add nome_da_playlist|musica_para_ser_adicionada
  const payload = message.content.substring(7).trimStart().split('|')
  
  let url
  let name
  const musicQuery = payload[1]
  const playlistName = payload[0]

  if(!musicQuery || !playlistName) {
    message.channel.send(ERROR_BAD_INPUT)
    return
  } 
  message.channel.send(`Adicionando música na Playlist ${playlistName}...`)

  if(ytDownload.validateURL(musicQuery)) {
    const ytDownloadRespose = await ytDownload.getBasicInfo(musicQuery)
    url = ytDownloadRespose.videoDetails.video_url
    name = ytDownloadRespose.videoDetails.title
  } else {
    const ytSearchResultList = await ytSearch(musicQuery, { limit: 3 })
    const filteredResultList = ytSearchResultList.items.filter(item => item.type === 'video')
    url = filteredResultList[0].url 
    name = filteredResultList[0].title
  }

  try {
    const { id } = await prisma.playlist.findFirst({ where: { name: playlistName } })
      .catch(e => { message.channel.send('Não encontrei essa playlist') })
      .finally(async () => { await prisma.$disconnect() })  

    if(id) {
      await prisma.track.create({
        data: {
          name,
          url,
          playlists: {
            create: [{ playlist: { connect: {id} } }]
          }
        },
      })  
        .catch(e => message.channel.send('Não consegui criar'))
        .finally(async () => { await prisma.$disconnect() }) 
    }  
    
  } catch {
    message.channel.send(ERROR_DB_NO_CONNECTION)
  } 
   
}

module.exports.deletePlaylist = async (message) => {
  const name = message.content.substring(10).trimStart()

  if(!name) {
    message.channel.send(ERROR_BAD_INPUT)
    return
  }
  
  try {
    prisma.playlist.delete({ where: name })
      .catch(e => { message.channel.send('não deu pra deletar') })
      .finally(async () => { await prisma.$disconnect() })
  } catch {
    message.channel.send(ERROR_DB_NO_CONNECTION)
  } 
}

module.exports.removeMusicFromPlaylist = (message) => {
  let name
  let musicName
  
  prisma.playlist.update({
    where: name,
    data: {
      tracks: tracks.filter(track => track.name !== musicName)
    }
  })
    .catch(e => { message.channel.send(ERROR_CREATING_PLAYLIST) })
    .finally(async () => { await prisma.$disconnect() })

}
