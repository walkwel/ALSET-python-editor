import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GemCollectorGame from './code/';
import CustomFunctionCode from './code/customCode';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/python';
import 'brace/mode/javascript';
import 'brace/theme/github';
import config from './config';
// stores
import GameStore1 from './store/game-store1';
import GameStore2 from './store/game-store2';
import GameStore3 from './store/game-store3';
import GameStore4 from './store/game-store4';

import './style.css';

const selectStore = mode => {
  switch (mode) {
    case 'player-vs-player': {
      return GameStore1;
    }
    case 'player-vs-bot': {
      return GameStore2;
    }
    case 'bot-vs-bot': {
      return GameStore3;
    }
    case 'bot-vs-custom-code': {
      return GameStore4;
    }
    default: {
      return GameStore2;
    }
  }
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: '0px 10px',
  },
  paper: {
    textAlign: 'center',
    padding: '40px 20px',
    cursor: 'pointer',
  },
  control: {
    padding: theme.spacing.unit * 2,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class PlayGemCollectorGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customFunctionCode: CustomFunctionCode,
      updatedCode: CustomFunctionCode,
      jsCode: '',
      updateJsCode: '',
      timestamp: 0,
      timing: 1000,
      showMode: true,
      showScore: true,
      scores: [0, 0],
      winner: null,
      playGame: null,
      errors: [],
      store: selectStore(this.props.mode),
      mode: 'python',
    };
    this.getCommands = this.getCommands.bind(this);
    this.getPlayersCommands = this.getPlayersCommands.bind(this);
    this.updateCustomCode = this.updateCustomCode.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.handleGameEvents = this.handleGameEvents.bind(this);
    this.onWin = this.onWin.bind(this);
    this.toggleScore = this.toggleScore.bind(this);
    this.toggleMode = this.toggleMode.bind(this);
  }

  handleGameEvents(event) {
    if (event.type === 'score_update') {
      if (event.scores[0] !== this.state.scores[0] || event.scores[1] !== this.state.scores[1]) {
        this.setState({ scores: event.scores });
      }
    }

    this.props.onGameEvent(event);
  }
  onWin(winner) {
    console.log('Winner..', winner);
    // this.setState({winner : winner});
  }

  toggleMode() {
    this.setState({ showMode: !this.state.showMode });
  }
  toggleScore() {
    this.setState({ showScore: !this.state.showScore });
  }

  getCommands(world, playerNum) {
    //let player = world.bodies.find(body=>{if(body.label==="character"&&body.customId===playerNum-1) return body;});
    let player = world.players[playerNum - 1];
    let closestGem = false;
    world.stones.forEach(stone => {
      if (closestGem === false) closestGem = stone;
      else if (
        Math.abs(
          Math.sqrt(closestGem.x * closestGem.x + closestGem.y * closestGem.y) -
            Math.sqrt(player.x * player.x + player.y * player.y),
        ) >
        Math.abs(
          Math.sqrt(stone.x * stone.x + stone.y * stone.y) - Math.sqrt(player.x * player.x + player.y * player.y),
        )
      ) {
        closestGem = stone;
      }
    });
    if (closestGem) {
      if (closestGem.x - player.x > 10) {
        return { left: false, right: true, up: false, down: false };
      } else if (closestGem.x - player.x < -10) {
        return { left: true, right: false, up: false, down: false };
      } else if (closestGem.y - player.y > 10) {
        return { left: false, right: false, up: false, down: true };
      } else if (closestGem.y - player.y < -10) {
        return { left: false, right: false, up: true, down: false };
      }
    } else if (Date.now() - this.state.timestamp >= this.state.timing) {
      const newState = Math.floor(Math.random() * (11 - 8 + 1) + 8);
      this.setState({ timestamp: Date.now() });
      if (newState === 11) {
        return { left: false, right: true, up: false, down: false };
      } else if (newState === 10) {
        return { left: false, right: false, up: false, down: true };
      } else if (newState === 9) {
        return { left: true, right: false, up: false, down: false };
      } else if (newState === 8) {
        return { left: false, right: false, up: true, down: false };
      }
    }
  }
  getPlayersCommands(world, playerNum) {
    try {
      let expression = this.state.customFunctionCode;

      let result = eval('(function() {' + expression + '}())');
      return result;
    } catch (err) {
      //console.log(err);
    }
  }
  getPyPlayersCommands(world, playerNum) {
    let None = null;
    let direction = { left: false, right: false, up: false, down: false };
    window.world = world;
    window.playerNum = playerNum;
    // console.log(window.newPySrc);
    try {
      const jscode = this.state.updateJsCode;
      let result = eval('(function() {' + jscode + '}())');
      const res = window.result || '';
      direction[res.toLowerCase()] = true;
      return direction;
    } catch (err) {
      // const jscode = window.oldPySrc;
      // let result = eval('(function() {' + jscode + '}())');
      const res = window.result || 'LEFT';
      direction[res.toLowerCase()] = true;
      return direction;
    }
  }
  updateCustomCode() {
    if (this.state.errors.length > 0) {
      console.log(this.state.errors);
      alert('Invalid code,please correct thr code');
      return;
    }
    this.props.onGameEvent({
      type: 'code_updated',
    });
    this.setState({ customFunctionCode: this.state.updatedCode });
  }

  handleChange(newCode) {
    if (this.state.mode === 'python') {
      this.setState({ updatedCode: newCode });
    } else {
      this.setState({ jsCode: newCode });
    }
  }
  handleValidation(messages) {
    const errors = messages.filter(msg => (msg.type === 'error' ? true : false));
    this.setState({ errors: errors });
  }
  handleMode = mode => {
    this.setState({ mode });
  };
  handleRunCode = () => {
    if (this.state.mode === 'python') {
      window.runPython(this.state.updatedCode);
      this.setState({ jsCode: window.newPySrc, updateJsCode: window.newPySrc });
    } else {
      window.newPySrc = this.state.jscode;
      this.setState({ updateJsCode: this.state.jsCode });
    }
  };
  componentDidMount() {
    window.newPySrc = '';
    window.oldPySrc = '';
    window.result = '';
    const interval = setInterval(() => {
      if (window.runPython) {
        this.handleRunCode();
        clearInterval(interval);
      }
    }, 500);
  }
  render() {
    const { showCodeEditor = false } = this.props;
    return (
      <div>
        {this.initGemCollector()}
        {showCodeEditor && this.initFunctionEditor()}
      </div>
    );
  }

  initGemCollector = () => {
    const { config, mode } = this.props;
    const { store, showMode, showScore } = this.state;
    switch (mode) {
      case 'player-vs-player': {
        return (
          <GemCollectorGame
            store={store}
            config={config}
            mode={mode}
            onGameEvent={this.handleGameEvents}
            onWin={winner => this.onWin(winner)}
          />
        );
      }
      case 'player-vs-bot': {
        return (
          <GemCollectorGame
            store={store}
            config={config}
            mode={mode}
            onWin={winner => this.onWin(winner)}
            onGameEvent={this.handleGameEvents}
            player2Function={world => this.getCommands(world, 2)}
          />
        );
      }
      case 'bot-vs-bot': {
        return (
          <GemCollectorGame
            store={store}
            config={config}
            mode={mode}
            onWin={winner => this.onWin(winner)}
            onGameEvent={this.handleGameEvents}
            player1Function={world => this.getCommands(world, 1)}
            player2Function={world => this.getCommands(world, 2)}
          />
        );
      }
      case 'bot-vs-custom-code': {
        return (
          <GemCollectorGame
            store={store}
            config={config}
            mode={mode}
            onWin={winner => this.onWin(winner)}
            onGameEvent={this.handleGameEvents}
            player1Function={world => this.getPyPlayersCommands(world, 1)}
            player2Function={world => this.getCommands(world, 2)}
          />
        );
      }
      default: {
        // player-vs-bot
        return (
          <GemCollectorGame
            store={store}
            config={config}
            mode={mode}
            onWin={winner => this.onWin(winner)}
            onGameEvent={this.handleGameEvents}
            player2Function={world => this.getCommands(world, 2)}
          />
        );
      }
    }
  };
  initFunctionEditor = () => {
    const { classes } = this.props;
    const { updatedCode, mode, jsCode } = this.state;
    const code = mode === 'python' ? updatedCode : jsCode;
    return (
      <div className="center">
        <div className="main">
          <div className="wrapper">
            <button
              type="button"
              className={mode === 'python' ? 'run' : 'run active'}
              onClick={() => this.handleMode('python')}
            >
              Python
            </button>
            <button
              type="button"
              className={mode === 'python' ? 'run active' : 'run'}
              onClick={() => this.handleMode('javascript')}
            >
              Javascript
            </button>
            <h4>
              Write <b style={{ color: '#4caf50' }}>{mode.toUpperCase()}</b> Code Here :{' '}
            </h4>
            <h5>
              <strong>Note : </strong>Please do not change the name of the function & function must return one of these
              direction (LEFT, RIGHT, UP, DOWN)
            </h5>
            <div id="editor" className="editor">
              <AceEditor
                mode={mode}
                theme="github"
                name="customFunctionCodeEditor"
                width={'100%'}
                onChange={this.handleChange}
                onValidate={this.handleValidation}
                fontSize={16}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                value={code}
                setOptions={{
                  enableBasicAutocompletion: false,
                  enableLiveAutocompletion: false,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                }}
              />
            </div>
            <div className="">
              <button type="button" className="run" id="run" onClick={this.handleRunCode}>
                RUN {mode.toUpperCase()}
              </button>
            </div>
          </div>
          <div id="js" className="js">
            <h4>Python Console</h4>
            <textarea id="python-console" className="res" />
          </div>
        </div>
      </div>
    );
  };
}

PlayGemCollectorGame.propTypes = {
  classes: PropTypes.object,
  onGameEvent: PropTypes.func,
  showCodeEditor: PropTypes.bool,
  mode: PropTypes.string,
};

PlayGemCollectorGame.defaultProps = {
  mode: config.mode,
  onGameEvent: () => {},
  onWin: () => {},
  showCodeEditor: config.showCodeEditor,
};

export default PlayGemCollectorGame;
