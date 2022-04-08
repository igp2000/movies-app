export default class SearchMovies {
  _baseUrl = 'https://api.themoviedb.org/3/';

  async getMovies(searchString, page = 1) {
    const url = `${
      this._baseUrl
    }search/movie?api_key=097e9f25fa19e1d64085bb8ef6221aeb&page=${page}&query=${encodeURIComponent(searchString)}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      throw new Error(`${resp.status}: ${resp.statusText}`);
    }
    if (resp.status !== 200) {
      throw new Error(`${resp.status}: Movies not found`);
    }
    return await resp.json();
  }

  async getGenres() {
    const url = `${this._baseUrl}genre/movie/list?api_key=097e9f25fa19e1d64085bb8ef6221aeb`;
    const resp = await fetch(url);

    if (!resp.ok) {
      throw new Error(`${resp.status}: ${resp.statusText}`);
    }
    if (resp.status !== 200) {
      throw new Error(`${resp.status}: Can't get list of genres`);
    }
    return await resp.json();
  }
}
