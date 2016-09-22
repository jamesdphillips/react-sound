'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _soundmanager2 = require('soundmanager2');

var pendingCalls = [];
var initialized = false;

function _createSound(options, cb) {
  if (_soundmanager2.soundManager.ok()) {
    cb(_soundmanager2.soundManager.createSound(options));
    return function () {};
  } else {
    var _ret = (function () {
      if (!initialized) {
        initialized = true;
        _soundmanager2.soundManager.beginDelayedInit();
      }

      var call = function call() {
        cb(_soundmanager2.soundManager.createSound(options));
      };

      pendingCalls.push(call);

      return {
        v: function () {
          pendingCalls.splice(pendingCalls.indexOf(call), 1);
        }
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }
}

_soundmanager2.soundManager.onready(function () {
  pendingCalls.slice().forEach(function (cb) {
    return cb();
  });
});

function noop() {}

var playStatuses = {
  PLAYING: 'PLAYING',
  STOPPED: 'STOPPED',
  PAUSED: 'PAUSED'
};

var Sound = (function (_React$Component) {
  _inherits(Sound, _React$Component);

  function Sound() {
    _classCallCheck(this, Sound);

    _get(Object.getPrototypeOf(Sound.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Sound, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.createSound(function (sound) {
        if (_this.props.playStatus === playStatuses.PLAYING) {
          sound.play();
        }
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.removeSound();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      var withSound = function withSound(sound) {
        if (!sound) {
          return;
        }

        if (_this2.props.playStatus === playStatuses.PLAYING) {
          if (sound.playState === 0) {
            sound.play();
          }

          if (sound.paused) {
            sound.resume();
          }
        } else if (_this2.props.playStatus === playStatuses.STOPPED) {
          if (sound.playState !== 0) {
            sound.stop();
          }
        } else {
          // this.props.playStatus === playStatuses.PAUSED
          if (!sound.paused) {
            sound.pause();
          }
        }

        if (_this2.props.playFromPosition !== prevProps.playFromPosition) {
          sound.setPosition(_this2.props.playFromPosition);
        }

        if (_this2.props.position != null) {
          if (sound.position !== _this2.props.position && Math.round(sound.position) !== Math.round(_this2.props.position)) {

            sound.setPosition(_this2.props.position);
          }
        }

        if (_this2.props.volume !== prevProps.volume) {
          sound.setVolume(_this2.props.volume);
        }

        sound.options.onfinish = function () {
          return _this2.props.onFinishedPlaying() || null;
        };
        sound.options.whileplaying = function () {
          return _this2.props.onPlaying(_this2) || null;
        };
        sound.options.whileloading = function () {
          return _this2.props.onLoading(_this2) || null;
        };
      };

      if (this.props.url !== prevProps.url) {
        this.createSound(withSound);
      } else {
        withSound(this.sound);
      }
    }
  }, {
    key: 'createSound',
    value: function createSound(callback) {
      var _this3 = this;

      this.removeSound();

      var props = this.props;

      if (!props.url) {
        return;
      }

      this.stopCreatingSound = _createSound({
        url: this.props.url,
        volume: props.volume,
        whileloading: function whileloading() {
          props.onLoading(this);
        },
        whileplaying: function whileplaying() {
          props.onPlaying(this);
        },
        onfinish: function onfinish() {
          props.onFinishedPlaying();
        }
      }, function (sound) {
        _this3.sound = sound;
        callback(sound);
      });
    }
  }, {
    key: 'removeSound',
    value: function removeSound() {
      if (this.stopCreatingSound) {
        this.stopCreatingSound();
        delete this.stopCreatingSound;
      }

      if (this.sound) {
        try {
          this.sound.destruct();
        } catch (e) {} // eslint-disable-line

        delete this.sound;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }], [{
    key: 'status',
    value: playStatuses,
    enumerable: true
  }, {
    key: 'propTypes',
    value: {
      url: _react.PropTypes.string.isRequired,
      playStatus: _react.PropTypes.oneOf(Object.keys(playStatuses)).isRequired,
      position: _react.PropTypes.number,
      playFromPosition: _react.PropTypes.number,
      volume: _react.PropTypes.number,
      onLoading: _react.PropTypes.func,
      onPlaying: _react.PropTypes.func,
      onFinishedPlaying: _react.PropTypes.func
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      playFromPosition: 0,
      volume: 100,
      onLoading: noop,
      onPlaying: noop,
      onFinishedPlaying: noop
    },
    enumerable: true
  }]);

  return Sound;
})(_react2['default'].Component);

exports['default'] = Sound;
module.exports = exports['default'];