((window) =>{
  const Spotify = token => {
    const fetchSettings  = { headers: { 'Authorization': `Bearer ${token}` } },
      baseUrl = 'https://api.spotify.com',

      getArtist = artistId => fetch(`${baseUrl}/v1/artists/${artistId}`, fetchSettings).then(response => response.json()).then(handleError),
      getRelatedArtists = artistId => fetch(`${baseUrl}/v1/artists/${artistId}/related-artists`, fetchSettings).then(response => response.json()).then(handleError),
      getTopTracks = artistId => fetch(`${baseUrl}/v1/artists/${artistId}/top-tracks?country=US`, fetchSettings).then(response => response.json()).then(handleError),
     
      getArtistData = artistId => new Promise((resolve, reject) => {  
        Promise.all([getArtist(artistId), getRelatedArtists(artistId), getTopTracks(artistId)])
          .then(artistData => resolve(Object.assign({}, ...artistData)))
          .catch(e => reject(e));
      }),
      handleError = response => {
        if(response.error && response.error.message === 'The access token expired') {
          return Promise.reject('expired token');
        } else if(response.error && response.error.status === 400) {
          return Promise.resolve(false);
        } else {
          return response;
        }
      };
    return {
      getArtist,
      getRelatedArtists,
      getTopTracks,
      getArtistData
    };
  }
  window.Spotify = Spotify;
})(window);
