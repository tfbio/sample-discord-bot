module.exports.inputChecker = (message) => {
  const songQuery = message.content.substring(5).trimStart()
  const originCheck = songQuery.slice(8,20)

  if(songQuery === '') return { songQuery, queryType: '' }

  if(originCheck === 'open.spotify') return { songQuery, queryType: 'Spotify' }
    else return { songQuery, queryType: 'Youtube' }
}