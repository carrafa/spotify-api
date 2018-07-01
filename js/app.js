const App = spotify => {
  const templates = {}, elements = {};
  templates.notFound = message => `
    <div class="not-found-container">
      <img src="img/frown.svg"/>
      <div class="message">${message}</div>
    </div>`;
  templates.primaryArtist = artist => `
    <div class="primary-artist-details-container">
      <div class="primary-artist-details">
        <div class="primary-artist-photo">
          <img src="${getImageUrl('large', artist.images)}"/>
        </div>
      <div class="total-followers"><strong>total followers:</strong> ${formatNumber(artist.followers.total)}</div>
      <a class="spotify-link" href="${artist.external_urls.spotify}"><img src="img/spotify.png"/>open in spotify</a>
      </div>
    </div>`;
  templates.relatedArtists = () => `
    <div>
      <div class="related-artists-header">related artists</div>
      <div class="related-artists"></div>
    </div>`;
  templates.relatedArtist = artist => `
    <div class="thumbnail">
      <img src="${getImageUrl('small', artist.images)}"/>
    </div>
    <div class="name">${artist.name}</div><a class="see-button" href="javascript:void(0)">
    <img src="img/see.svg"/></a>`;
  templates.track = track => `
    <img src="${getImageUrl('small', track.album.images)}"/>
    <a class="preview-button play" href="javascript:void(0)"><img class="play"/></a>
    <div class="track-name">${track.name}</div>`;
  templates.nowPlaying = track => `
    <img class="notes-icon" src="img/notes.svg"/>
    <div class="now-playing-details"><span class="track">${track.name}</span> by <span class="artist">${track.artists.map(artist => artist.name).join(' & ')}</span></div>
    <img src="${getImageUrl('small', track.album.images)}"/>`;

  elements.primaryArtist = (artist = {}) => {
    const primaryArtistEl = document.createElement('div');
    primaryArtistEl.className = "primary-artist";
    if(Object.keys(artist).length === 0) {
      primaryArtistEl.innerHTML = templates.notFound('artist not found');
      return primaryArtistEl;
    }
    primaryArtistEl.innerHTML = templates.primaryArtist(artist);
    primaryArtistEl.querySelector('img').addEventListener('load', e => setTracksHeight());
    const topTracksEl = elements.topTracks(artist.tracks);
    primaryArtistEl.appendChild(topTracksEl);
    return primaryArtistEl;
  };

  elements.relatedArtists = (artists = []) => {
    const relatedArtistsEl = document.createElement('div');
    relatedArtistsEl.className = 'related-artists-container';
    if(artists.length === 0) {
      relatedArtistsEl.innerHTML = templates.notFound('related artists not found');
      return relatedArtistsEl;
    }
    relatedArtistsEl.innerHTML = templates.relatedArtists();
    artists.forEach(artist => {
      let el = document.createElement('div');
      el.className = 'related-artist';
      el.innerHTML = templates.relatedArtist(artist);
      el.addEventListener('click', e => handleRelatedArtistClick(artist));
      relatedArtistsEl.querySelector('.related-artists').appendChild(el);
    });
    return relatedArtistsEl;
  };

  elements.topTracks = tracks => {
    const topTracks = document.createElement('div');
    topTracks.className = 'top-tracks-container';
    tracks.forEach(track => topTracks.appendChild(elements.track(track)));
    return topTracks;
  };

  elements.track = track => {
    const trackEl = document.createElement('div');
    trackEl.className = 'top-track';
    trackEl.innerHTML = templates.track(track);
    trackEl.querySelector('.preview-button').addEventListener('click', e => handleTrackClick(e, track));
    return trackEl;
  }

  const renderArtist = (artist = {}) => {
    const artistEl = elements.primaryArtist(artist);
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(artistEl);
    if(Object.keys(artist).length === 0) {
      return;  
    }
    const relatedArtistsEl = elements.relatedArtists(artist.artists);
    document.getElementById('current-artist').innerHTML = artist.name || '';
    document.getElementById('app').appendChild(relatedArtistsEl);
  };

  const handleRelatedArtistClick = artist => {
          loadArtist(artist.id);
          document.body.scrollTop = document.documentElement.scrollTop = 0;
        },
        handleTrackClick = (e, track) => {
          if(e.target.classList.contains('play')) {
            setNowPlaying(track);
            document.querySelectorAll('.pause').forEach(el => {
              el.classList.remove('pause');
              el.classList.add('play');
            });
            e.target.classList.add('pause');
            e.target.classList.remove('play');
            document.getElementById('current-track').src = track.preview_url;
          } else {
            e.target.classList.add('play');
            e.target.classList.remove('pause');
            document.getElementById('now-playing').innerHTML = '';
            document.getElementById('current-track').src = '';
          }
        };

  const setTracksHeight = () => document.querySelector('.top-tracks-container').style.maxHeight = document.querySelector('.primary-artist-details').offsetHeight + 'px',
        setNowPlaying = track => document.getElementById('now-playing').innerHTML = templates.nowPlaying(track),
        formatNumber = number => new Intl.NumberFormat('en-US', {style: 'decimal'}).format(number),
        getImageUrl = (size, images = []) => {
          const index = size === 'large' ? 0 : images.length - 1;
          return images[index] ? images[index].url : 'img/notes.svg';
        },
        loadArtist = id => spotify.getArtistData(id)
          .then(renderArtist)
          .catch(e => {
            if(e === 'expired token') {
              loadLoginPage();
            } else {
              document.body.innerHTML = templates.notFound('something broke!');
            }
          });

   return {
    start: id => loadArtist(id)
  }
}

const loadLoginPage = () => document.body.innerHTML = `<div id="login-container"><a class="login-button" href="https://accounts.spotify.com/authorize?client_id=9898336d5db44e97bfaa0ebd4604e47a&redirect_uri=http%3A%2F%2Fwww.carrafa.nyc%2Fspotify%2F&response_type=token">login</a></div>`;
const init = () => {
  const params = {},
  query = window.location.hash.replace('#', '').split('&');
  for(let i = 0; i < query.length; i++) {
    const param = query[i].split('=');
    params[param[0]] = param[1];
  }
  if(!params.access_token) {
    loadLoginPage();
  } else {
    const artistId = params.artistId || '4dpARuHxo51G3z768sgnrY',
          spotify = Spotify(params.access_token),
          app = App(spotify);
    app.start(artistId);
  }
};

document.addEventListener('DOMContentLoaded', e => init());