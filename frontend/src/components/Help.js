import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Icon from './Icon';

const Help = ({ id, children, ...rest }) => (
  <OverlayTrigger
    overlay={<Tooltip id={id}>{children}</Tooltip>}
    placement="top"
  >
    <Icon
      className="bt-help-icon"
      name="question-circle"
      format="regular"
      {...rest}
    />
  </OverlayTrigger>
);

Help.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Help;
