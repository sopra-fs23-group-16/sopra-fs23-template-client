import {useEffect, useState} from 'react';
import {api, handleError} from 'helpers/api';
import {Button} from 'components/ui/Button';
import {Link, useHistory} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/RoomCreation.scss";


const RoomCreation = () => {

  const history = useHistory();

  const [users, setUsers] = useState(null);

  const logout = () => {
    localStorage.removeItem('token');
	let id = localStorage.getItem("loggedInUser");
    localStorage.removeItem("loggedInUser");
    const response = api.get('/logout/'+id);
    history.push('/login');
}

  const goLobby = async () => {
    let id = localStorage.getItem("loggedInUser");
      try {
        history.push(`/lobby`);
      } catch (error) {
        alert(`Something went room: \n${handleError(error)}`);
      }
    };

  return (
    <BaseContainer>
	<div className="creation container">
    <h1>Game Overview</h1>
      <div className="creation form">
          <div className="creation button-container">
            <Button 
              width="70%"
              //onClick={() => }
            >
              Create A New Room
            </Button>
          </div>
          <div className="creation button-container">
            <Button
              width="70%"
              //onClick={() => }
            >
              Join An Existing Room
            </Button>
          </div>
		  <div className="creation button-container">
            <Button
              width="70%"
              onClick={() => goLobby()}
            >
              Back to Lobby
            </Button>
          </div>
		  <div className="creation button-container">
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

export default RoomCreation;