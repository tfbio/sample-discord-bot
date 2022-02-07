module.exports =  {
  ERROR_EMPTY_PLAY_COMMAND:  '❌ Error  |  Irmão, o !play tava vazio...',

  ERROR_QUEUE_NO_NEXT_MUSIC: '❌ Error  |  Não tem próxima música para dar ser tocada',

  ERROR_NO_SONGS_IN_QUEUE:   '❌ Error  |  Ainda sem nenhuma musica na lista',

  ERROR_CANT_PLAY_SONG:      '❌ Error | Tive um problema para tocar a próxima música...',

  ERROR_GETTING_PLAYLISTS:   '❌ Error | Tive um problema na hora de buscar todas as playlists...',

  ERROR_GETTING_MUSICS:      '❌ Error | Tive um problema na hora de buscar músicas...',

  ERROR_CREATING_PLAYLIST:   '❌ Error | Tive um problema na hora de criar uma nova playlist...',

  ERROR_BAD_INPUT:           '❌ Error | Como o comando vazio/incompleto aí não dá né Zé...',

  ERROR_DB_NO_CONNECTION:    '❌ Error | ...o banco das playlists pode estar desconectado.',

  QUEUE_MUSIC_ADDED: (title) => {
    return `🎵 Playing  |  Adicionando na lista a música ${title}`
  },

  QUEUE_LOADING_MUSIC: (title) => {
    return `🎵 Playing  |  Carregando música ${title}`
  },

  ERROR_UNKNOWN_COMMAND:     '❌ Error  |  Como que é caralho? usa !help ai.',

  HELP_COMMANDS: `Básicos: \n\t !play nome_da_música ou url_da_música\n\t !next  !pause  !resume  !stop  !remove\n

  Comandos de Playlist: 
  \t!pl-list  
  \t!pl-new nome_da_playlist 
  \t!pl-add nome_da_playlist|nome_da_música ou url_da_música
  \t!pl-show nome_da_playlist
  \t!pl-play nome_da_playlist
  \t!pl-delete nome_da_playlist`
}  
