export default class SearchMovies {
  _baseUrl = 'https://api.themoviedb.org/3/';
  _apiKey = 'api_key=097e9f25fa19e1d64085bb8ef6221aeb';

  getMovies(searchString, page = 1) {
    const url = `${this._baseUrl}search/movie?${this._apiKey}&page=${page}&query=${encodeURIComponent(searchString)}`;
    return this._fetch(url);
  }

  getGenres() {
    const url = `${this._baseUrl}genre/movie/list?${this._apiKey}`;
    return this._fetch(url);
  }

  setRating(id, sessId, num) {
    const url = `${this._baseUrl}/movie/${id}/rating?${this._apiKey}&guest_session_id=${sessId}`;
    const data = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ value: num }),
    };
    return this._fetch(url, data);
  }

  getSessionId() {
    const url = `${this._baseUrl}authentication/guest_session/new?${this._apiKey}`;
    return this._fetch(url);
  }

  async _fetch(url, data = null) {
    const resp = await fetch(url, data);

    if (!resp.ok) {
      throw new Error(`${resp.status}: ${resp.statusText}`);
    }
    return await resp.json();
  }
}
