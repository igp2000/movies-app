import React from 'react';
import PropTypes from 'prop-types';

import { CardFilm } from '../CardFilm';

import './ListCardFilm.scss';

function ListCardFilm({ listMovies, onChangeRate }) {
  let listCards = [];
  listMovies.map((item) => {
    const { id, ...args } = item;
    listCards.push(<CardFilm id={id} {...args} onChangeRate={onChangeRate} key={id} />);
  });

  return <div className="list-card-film">{listCards}</div>;
}

ListCardFilm.propTypes = {
  listMovies: PropTypes.array,
  onChangeRate: PropTypes.func,
};

ListCardFilm.defaultProps = {
  listMovies: [],
  onChangeRate: () => {},
};

export default ListCardFilm;
