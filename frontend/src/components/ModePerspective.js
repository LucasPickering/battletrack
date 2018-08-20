import PropTypes from 'prop-types';
import React from 'react';

import {
  formatGameMode,
  formatPerspective,
} from 'util/formatters';

import Help from './Help';
import 'styles/ModePerspective.css';

const ModePerspective = ({ mode, perspective }) => {
  const modeStr = formatGameMode(mode);
  return (
    <div className="bt-mode-perspective">
      {mode === 'custom'
        ? (
          <React.Fragment>
            {modeStr}
            <Help id="custom-game-tooltip">
              Custom games don&apos;t have a game mode or perspective in PUBG&apos;s API data
            </Help>
          </React.Fragment>
        )
        : `${modeStr} ${formatPerspective(perspective)}`}
    </div>
  );
};

ModePerspective.propTypes = {
  mode: PropTypes.string.isRequired,
  perspective: PropTypes.string,
};

ModePerspective.defaultProps = {
  perspective: null,
};

export default ModePerspective;
