const ytDownload = require('ytdl-core')
const ytpl = require('ytpl')
const ytSearch = require('ytsr')
const { ERROR_QUEUE_NO_NEXT_MUSIC, QUEUE_LOADING_MUSIC, QUEUE_MUSIC_ADDED, ERROR_EMPTY_PLAY_COMMAND, ERROR_CANT_PLAY_SONG, ERROR_NO_SONGS_IN_QUEUE } = require('./messages')
const Spotify = require('spotifydl-core').default
const { inputChecker } = require('./utils/inputChecker')
const { musicProcessor } = require('./utils/musicProcessor')


const ffpmeg = require('fluent-ffmpeg')
const pathToFFmpeg = require('ffmpeg-static')
ffpmeg.setFfmpegPath(pathToFFmpeg)

module.exports = class MusicPlayer {
  
  constructor() {
    this.playerSetted = false
    this.musicPlayer = null
    this.connection = null
    this.subscription = null
    this.queue = []
    this.lastState = 'idle'
    this.currentState = 'idle'
    this.isPlaying = false
    this.isPaused = false
    this.spotify = null
  }

  initPlayerStatesHandler(message) {
    this.playerSetted = true

    this.musicPlayer.on('stateChange', async (oldState, newState) => {
      this.lastState = oldState.status
      this.currentState = newState.status

      if((oldState.status === 'playing' && newState.status === 'idle' && this.queue.length === 0)) {
        this.musicPlayer.stop()
      }

      if(     (oldState.status === 'playing' && newState.status === 'idle' && this.queue.length > 0) 
          && !(oldState.status === 'buffering' && newState.status === 'playing') 
          && newState.status !== 'buffering'  
        ) await this.playMusicRoutine(message)

      this.currentState === 'playing' ? this.isPlaying = true : this.isPlaying = false   
    })   
    
  }

  async youtubeSearch(songQuery) {
    if(ytDownload.validateURL(songQuery)) {
      const ytDownloadRespose = await ytDownload.getBasicInfo(songQuery);

      const response = {
        url: ytDownloadRespose.videoDetails.video_url,
        title: ytDownloadRespose.videoDetails.title,
      }
      return response

    } else {
      const ytSearchResultList = await ytSearch(songQuery, { limit: 5 })
      const filteredResultList = ytSearchResultList.items.filter(item => item.type === 'video' || 'playlist')

      if(filteredResultList[0].type === 'playlist') {
        const { items } = await ytpl(filteredResultList[0].playlistID)
        const response = items.map(item => {
          return { url:item.url, title: item.title }
        })
        return response

      } else {
        const { url, title } = filteredResultList[0]  
        const response = {
          url,
          title,
        }
        return response 

      }
    }

  }

  async spotifySearch(playlistUrl) {
    const response = []
    const { tracks } = await this.spotify.getPlaylist(playlistUrl)

    for (const track of tracks) {
      const { name, artists } = await this.spotify.getTrack(`https://open.spotify.com/track/${track}`)
      const ytSearchResultList = await ytSearch(name+artists, { limit: 3 })
      const filteredResultList = ytSearchResultList.items.filter(item => item.type === 'video')
      const { url, title } = filteredResultList[0]  
      response.push({ url, title })
    }

    return response
  }

  async manageQueue(message) {
    const { songQuery, queryType } = inputChecker(message)
    
    if(queryType === 'Spotify') {
      const responses = await this.spotifySearch(songQuery)

      responses.forEach(response => {
        const audioResource = musicProcessor(response.title, response.url)
        this.queue.push(audioResource)
      })

      return { success: true, title: responses[0].title }
    }

    else if(queryType === 'Youtube') {
      const responses = await this.youtubeSearch(songQuery)    

      if(responses.length) {
        responses.forEach(response => {
          const audioResource = musicProcessor(response.title, response.url)
          this.queue.push(audioResource)
        })

        return { success: true, title: responses[0].title }
      } else {
        const audioResource = musicProcessor(responses.title, responses.url)
        this.queue.push(audioResource)
  
        return { success: true, title: responses.title }
      }
    }

    else return { success: false, title: '' }
  }

  async manageCustomPlaylist(musicList) {
    musicList.forEach(music => {
      const audioResource = musicProcessor(music.name, music.url)
      this.queue.push(audioResource)
    })

    if(this.isPaused === false && this.isPlaying === false) {
      this.musicPlayer.play(this.queue[0])
      this.queue.shift()
    }
  }

  async playMusicRoutine(message) {
    if(!this.connection) return 

    if(this.isPlaying && this.currentState === 'playing') {
      const { success, title } = await this.manageQueue(message)
      if(success === true) {
        message.channel.send(QUEUE_MUSIC_ADDED(title))
      } else {
        message.channel.send(ERROR_EMPTY_PLAY_COMMAND)
      }
        
      return
    }

    if(this.queue.length > 1 || (this.queue.length === 1 && this.isPlaying)) {
      if(!this.queue[0]) {
        message.channel.send(ERROR_CANT_PLAY_SONG)
      } else {
        try {
          this.musicPlayer.play(this.queue[0])
          this.queue.shift()
        } catch {
          if(this.queue.length > 1) {
            this.queue.shift()
            this.musicPlayer.play(this.queue[0])
          }
        }
      }

      return
    }

    if(this.currentState === 'idle') {
      const { success, title } = await this.manageQueue(message)
      if(success) {
        message.channel.send(QUEUE_LOADING_MUSIC(title))
        this.musicPlayer.play(this.queue[0])
        this.queue.shift()
      } else {
        message.channel.send(ERROR_EMPTY_PLAY_COMMAND)
      }

      return
    }
  }

  showQueue(message) {
    if(this.queue.length === 0) message.channel.send(ERROR_NO_SONGS_IN_QUEUE)

    const messagesArray = this.queue.map(song => {
      return `\n - ${song.songTitle}`
    })
    const discordMessage = messagesArray.join(' ')
    message.channel.send('Músicas na fila:' + discordMessage)
  }

  stop() {
    this.musicPlayer.stop(true)
    this.queue = []
    this.lastState = 'idle'
    this.currentState = 'idle'
  } 
  
  pause() {
    this.isPaused = true
    this.musicPlayer.pause(true)
  }

  resume() {
    this.isPaused = false
    this.musicPlayer.unpause()
  }

  remove() {
    if(this.queue.length > 0) this.queue.pop()
  }

  playNextSong(message) {
    if(this.queue.length > 0) {
      this.musicPlayer.play(this.queue[0])
      this.queue.shift()
    } else {
      message.channel.send(ERROR_QUEUE_NO_NEXT_MUSIC)
    }

  }
}
