import React, { Component } from 'react';
//import { format, formatDistanceToNow } from 'date-fns';

import { Provider } from '../AppContext';
import SearchMovies from '../../services/services';
import { ListCardFilm } from '../ListCardFilm';
import { InputSearch } from '../InputSearch';
import { Spinner } from '../Spinner';
import { ErrorMessage } from '../ErrorMessage';
import { Paginator } from '../Pagination';
import { TabsMovies } from '../TabsMovies';

import 'antd/dist/antd.css';
import '../../css/styles.css';
import './App.scss';

export default class App extends Component {
  componentDidMount() {
    window.addEventListener('offline', this.internetError);
    window.addEventListener('online', this.internetError);
    this.getSessionId();
    this.getGenres();

    // объект для хранения фильмов с рейтингом
    if (!('ratedMovies' in localStorage)) {
      localStorage.setItem(
        'ratedMovies',
        JSON.stringify({ listMovies: [], keysList: [], totalResults: 0, currentPage: 1 })
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.internetError);
    window.removeEventListener('online', this.internetError);
  }

  componentDidCatch(error) {
    this.setState({ error: `${error.status}: ${error.statusText}` });
    alert(`${error.status}: ${error.statusText}`);
  }

  SearchMovies = new SearchMovies();

  state = {
    listMovies: [], // отображаемый в данный момент список фильмов
    totalResults: 0,
    currentPage: 1,
    searchString: '',
    loading: false,
    error: '',
    online: true,
    tabRated: false,
    session: {
      id: null,
      expire: null,
    },
  };

  // список жанров
  mapGenres = new Map();

  // объект для хранения выборки фильмов, полученных с сервера
  onlineData = {
    listMovies: [],
    totalResults: 0,
    currentPage: 1,
  };

  // слушатель доступности интернет
  internetListener(event) {
    if (event.type === 'offline') {
      this.setState({ online: false, error: 'Error: No internet connection' });
    } else {
      this.setState({ online: true, error: '' });
    }
  }
  internetError = this.internetListener.bind(this);

  // Получаем ID гостевой сессии
  getSessionId() {
    let flag = true;
    if (this.state.session.expire) {
      const arr = this.state.session.expire.split(' ');
      const date = new Date(`${arr[0]}T${arr[1]}Z`);
      flag = date.getTime() < Date.now();
    }

    if (flag) {
      this.SearchMovies.getSessionId()
        .then((obj) => {
          if (!obj.success) {
            throw 'Invalid guest session';
          }
          this.setState({
            session: {
              id: obj.guest_session_id,
              expire: obj.expires_at,
            },
          });
        })
        .catch((err) => {
          this.setState({
            error: err,
            session: {
              id: null,
              expire: null,
            },
          });
        });
    }
  }

  // получаем список жанров
  getGenres() {
    this.SearchMovies.getGenres()
      .then((list) => {
        if (list.genres) {
          list.genres.forEach((item) => {
            this.mapGenres.set(item['id'], item['name']);
          });
        } else {
          throw 'The list of genres is empty';
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  }

  // получаем выборку фильмов с сервера
  getMovies = (str, page) => {
    let obj = {
      listMovies: [],
      totalResults: 0,
    };

    this.setState(obj);
    this.onlineData.listMovies = [];
    this.onlineData.totalResults = 0;

    if (this.state.online) {
      obj = { error: '' };
    }

    if (!str.trim()) {
      obj.currentPage = 1;
      this.setState(obj);
      this.onlineData.currentPage = 1;
      return;
    }

    obj.loading = true;

    this.getSessionId();

    this.setState(obj);
    this.onlineData.listMovies = [];
    this.onlineData.totalResults = 0;

    this.SearchMovies.getMovies(str, page)
      .then((list) => {
        if (list.total_results === 0 || list.results.length === 0) {
          throw new Error('Movies not found');
        }

        const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies'));

        const newList = list.results.map((item) => {
          const ind = ratedMovies.keysList.indexOf(item.id);
          return {
            id: item.id,
            genre_ids: item.genre_ids,
            poster_path: item.poster_path,
            release_date: item.release_date,
            title: item.title,
            overview: this.shortDescription(item.overview),
            vote_average: item.vote_average,
            stars: ind > -1 ? ratedMovies.listMovies[ind].stars : 0,
          };
        });
        this.setState({ listMovies: newList, totalResults: list.total_results, currentPage: page });
        this.onlineData.listMovies = newList;
        this.onlineData.totalResults = list.total_results;
        this.onlineData.currentPage = page;
      })
      .catch((err) => {
        const error = this.state.online ? err : 'Error: No internet connection';
        this.setState({ error: error });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  // обрезаем текст до 35 слов
  shortDescription(desc) {
    const words = desc.split(' ');
    let str = words.slice(0, 35).join(' ');
    if (words.length > 35) {
      str += ' ...';
    }
    return str;
  }

  // сохраняем поисковую строку в state
  setSearchString = (str) => {
    this.setState({ searchString: str });
  };

  // получаем очередную порцию фильмов с рейтиногом
  getListRated(page, arr) {
    const start = (page - 1) * 20;
    let end = start + 20;
    return arr.slice(start, end);
  }

  // слушатель изменения страница
  onChangePage = (page) => {
    if (!this.state.tabRated) {
      this.setState({ currentPage: page });
      this.getMovies(this.state.searchString, page);
    } else {
      const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies'));
      this.setState({
        listMovies: this.getListRated(page, ratedMovies.listMovies),
        totalResults: ratedMovies.totalResults,
        currentPage: page,
      });
      ratedMovies.currentPage = page;
      localStorage.setItem('ratedMovies', JSON.stringify(ratedMovies));
    }
  };

  // слушатель переключения вкладок
  setTabRated = (flag) => {
    if (flag) {
      const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies'));
      this.setState({
        tabRated: flag,
        listMovies: this.getListRated(ratedMovies.currentPage, ratedMovies.listMovies),
        totalResults: ratedMovies.totalResults,
        currentPage: ratedMovies.currentPage,
        error: this.state.online ? '' : this.state.error,
      });
    } else {
      this.setState({
        tabRated: flag,
        listMovies: this.onlineData.listMovies,
        totalResults: this.onlineData.totalResults,
        currentPage: this.onlineData.currentPage,
        error: this.state.online ? '' : this.state.error,
      });
    }
  };

  // слушатель изменения рейтинга
  onChangeRate = (id, number) => {
    this.SearchMovies.setRating(id, this.state.session.id, number)
      .then((res) => {
        if (res.status_code !== 1 && res.status_code !== 12) {
          throw res.status_message;
        }

        const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies'));

        let ind = this.onlineData.listMovies.findIndex((item) => item.id === id);
        if (ind > -1) {
          this.onlineData.listMovies[ind].stars = number;
          if (!this.state.tabRated) {
            this.setState({ listMovies: this.onlineData.listMovies });
          }
        }

        const indRated = ratedMovies.keysList.indexOf(id);
        if (indRated > -1) {
          ratedMovies.listMovies[indRated].stars = number;
          if (this.state.tabRated) {
            this.setState({ listMovies: ratedMovies.listMovies });
          }
        } else {
          ratedMovies.listMovies.push(this.onlineData.listMovies[ind]);
          ratedMovies.keysList.push(id);
          ratedMovies.totalResults = ratedMovies.keysList.length;
        }
        localStorage.setItem('ratedMovies', JSON.stringify(ratedMovies));
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  render() {
    const spin = this.state.loading ? <Spinner /> : null;
    const content = !this.state.loading ? (
      <ListCardFilm listMovies={this.state.listMovies} onChangeRate={this.onChangeRate} />
    ) : null;
    const error = this.state.error ? <ErrorMessage message={this.state.error} /> : null;
    const paginator = this.state.totalResults ? (
      <Paginator onChange={this.onChangePage} total={this.state.totalResults} current={this.state.currentPage} />
    ) : null;

    return (
      <Provider value={this.mapGenres}>
        <div className="app">
          <TabsMovies setTabRated={this.setTabRated} />
          <InputSearch
            getMovies={this.getMovies}
            setSearchString={this.setSearchString}
            searchString={this.state.searchString}
            inputHidden={this.state.tabRated}
          />
          {error}
          {spin}
          {content}
          {paginator}
        </div>
      </Provider>
    );
  }
}
