import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

import './InputSearch.scss';

export default class InputSearch extends Component {
  static defaultProps = {
    getMovies: () => {},
    setSearchString: () => {},
    searchString: '',
    inputHidden: true,
  };
  static propTypes = {
    getMovies: PropTypes.func,
    setSearchString: PropTypes.func,
    searchString: PropTypes.string,
    inputHidden: PropTypes.bool,
  };

  inputRef = React.createRef();

  componentDidMount() {
    this.debounced = debounce(() => this.props.getMovies(this.props.searchString, 1), 500);
    this.inputRef.current.focus();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.searchString !== this.props.searchString) {
      this.debounced();
    }
  }
  componentWillUnmount() {
    if (this.debounced) {
      this.debounced.cancel();
    }
  }

  onChange = (event) => {
    this.props.setSearchString(event.target.value);
  };

  render() {
    return (
      <form className="form-search" hidden={this.props.inputHidden} onSubmit={(event) => event.preventDefault()}>
        <label>
          <input
            className="input-search"
            placeholder="Type to search ..."
            onChange={this.onChange}
            value={this.props.searchString}
            ref={this.inputRef}
          />
        </label>
      </form>
    );
  }
}
