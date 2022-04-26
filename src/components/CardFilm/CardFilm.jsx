import React, { Component } from 'react';
import { Card, Rate } from 'antd';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import { Consumer } from '../AppContext';

import './CardFilm.scss';

export default class CardFilm extends Component {
  static defaultProps = {
    poster_path: '',
    title: '',
    release_date: '---------',
    vote_average: 0,
    overview: '',
  };

  static propTypes = {
    poster_path: PropTypes.string,
    title: PropTypes.string,
    release_date: PropTypes.string,
    vote_average: PropTypes.number,
    overview: PropTypes.string,
  };

  state = {
    cardFilm: {},
    cardDesc: {},
    stars: {},
  };

  _cardFilm = {
    width: '454px',
    height: '281px',
    position: 'relative',
    filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15))',
    margin: '17px',
  };
  _cardFilmMobil = {
    width: '100%',
    height: '245px',
    margin: '8px',
  };

  _cardDesc = {
    width: '203px',
    margin: '-10px 0 9px 180px',

    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '12px',
    lineHeight: '22px',
    alignItems: 'center',
    color: '#827E7E',
  };
  _cardDescMobil = {
    width: '100%',
    margin: '-20px 0 9px 60px',
  };

  _stars = {
    width: '239px',
    height: '20px',
    whiteSpace: 'nowrap',
    transform: 'scale(0.8, 0.8)',
  };

  componentDidMount() {
    this.setStyle();
    window.addEventListener('resize', this.setStyle);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setStyle);
  }

  setStyle = () => {
    if (document.documentElement.clientWidth > 522) {
      this.setState({ cardFilm: this._cardFilm, cardDesc: this._cardDesc });
    } else {
      this.setState({ cardFilm: this._cardFilmMobil, cardDesc: this._cardDescMobil });
    }
  };

  posterPath = (poster) => {
    return poster ? <img className="film-image" src={`https://image.tmdb.org/t/p/w500${poster}`} /> : null;
  };

  releaseDate = (date) => {
    let dat = '';
    try {
      dat = date ? format(new Date(date), 'MMMM d, y') : '---------';
    } catch {
      dat = '---------';
    }
    return dat;
  };

  onChangeRate = (number) => {
    this.props.onChangeRate(this.props.id, number);
  };

  render() {
    const { genre_ids, poster_path, title, release_date, stars, vote_average, overview } = this.props;

    let rateColor = '#E90000';
    if (vote_average > 3) {
      rateColor = '#E97E00';
      if (vote_average > 5) {
        rateColor = '#E9D100';
        if (vote_average > 7) {
          rateColor = '#66E900';
        }
      }
    }

    return (
      <Consumer>
        {(mapGenres) => {
          let genres = genre_ids.map((item) => {
            const genre = mapGenres.get(item);
            if (genre) {
              return (
                <div className="genre" key={item}>
                  {genre}
                </div>
              );
            }
          });
          if (!genres.length) {
            genres = <div className="genre">------</div>;
          }
          return (
            <Card style={this.state.cardFilm}>
              <div className="rate-text" style={{ borderColor: rateColor }}>
                <span>{vote_average}</span>
              </div>
              {this.posterPath(poster_path)}
              <Card.Meta title={title} description={this.releaseDate(release_date)} style={this.state.cardDesc} />
              <div className="card-body">
                <div className="list-genre">{genres}</div>
                <div className="description">
                  <span>{overview}</span>
                </div>
                <div className="rate">
                  <Rate
                    count={10}
                    allowHalf
                    defaultValue={2.5}
                    value={stars}
                    style={this._stars}
                    onChange={this.onChangeRate}
                  />
                </div>
              </div>
            </Card>
          );
        }}
      </Consumer>
    );
  }
}
