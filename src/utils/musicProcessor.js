const ytDownload = require('ytdl-core')
const { createAudioResource } = require('@discordjs/voice')

module.exports.musicProcessor = (title, url) => {
  const audioResource = createAudioResource(ytDownload(url, {
    quality         : "lowestaudio",
    opusEncoded     : true,
    dlChunkSize     : 0,
    highWaterMark   : 1 << 25,
  }))
  
  audioResource.songTitle = title
  audioResource.songUrl = url

  return audioResource
}