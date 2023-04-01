import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";

export const RegisterGuard = props => {
  if (!localStorage.getItem("token")) {
    return props.children;
  }
  return <Redirect to="/lobby"/>;
};

RegisterGuard.propTypes = {
  children: PropTypes.node
};