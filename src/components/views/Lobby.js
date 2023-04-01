import {useEffect, useState} from 'react';
import {api, handleError} from 'helpers/api';
import {Button} from 'components/ui/Button';
import {Link, useHistory} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Lobby.scss";

const Lobby = () => {

  const history = useHistory();

  const [users, setUsers] = useState(null);

  const logout = () => {
    localStorage.removeItem('token');
	let id = localStorage.getItem("loggedInUser");
    localStorage.removeItem("loggedInUser");
    const response = api.get('/logout/'+id);
    history.push('/login');
}

  const doInspect = async () => {
	let id = localStorage.getItem("loggedInUser");
    try {
      history.push(`/users/${id}`);
    } catch (error) {
      alert(`Inspect failed: \n${handleError(error)}`);
    }
  };

  return (
    <BaseContainer>
	<div className="lobby container">
    <h1>Game Overview</h1>
      <div className="lobby form">
          <div className="lobby button-container">
            <Button 
              width="70%"
              //onClick={() => }
            >
              Single Mode
            </Button>
          </div>
          <div className="lobby button-container">
            <Button
              width="70%"
              //onClick={() => }
            >
              Competition Mode
            </Button>
          </div>
		  <div className="lobby button-container">
            <Button
              width="70%"
              onClick={() => doInspect()}
            >
              Your Profile
            </Button>
          </div>
		  <div className="lobby button-container">
            <Button
              width="70%"
              onClick={() => logout()}
            >
              Exit
            </Button>
          </div>
        </div>
	</div>
    </BaseContainer>
  );
}

export default Lobby;