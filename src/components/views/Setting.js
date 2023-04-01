import React, {useEffect, useState} from 'react';
import {api, handleError} from 'helpers/api';
import User from 'models/User';
import {useHistory, useParams} from 'react-router-dom';
import {Spinner} from 'components/ui/Spinner';
import {Button} from 'components/ui/Button';
import 'styles/views/Lobby.scss';
import 'styles/views/Login.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const Player = ({user}) => (
    <div className="player container">
        <div className="player id">id: {user.id}</div>
        <div className="player username">{user.username}</div>
		<div className="player password">{user.password}</div>
    </div>
);

const FormField = props => {
  return (
    <div className="login field">
      <label className="login label">
        {props.label}
      </label>
      <input
        className="login input"
        placeholder="Change your information:"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

Player.propTypes = {
    user: PropTypes.object
};

const Setting = props => {
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  let {userId} = useParams();
  
  const confirm = async () => {
        let item = {username, password}
        console.warn("item", item)
            try {
                const requestBody = JSON.stringify({username, password});
                const response = await api.put('/users/' + userId, requestBody);

                // Get the returned user and update a new object.
                const user = new User(response.data);
                history.push(`/users/${userId}`);


            } catch (error) {
                alert(`Something went wrong: \n${handleError(error)}`);
            }
        }

    useEffect(() => {
        // effect callbacks are synchronous to prevent race conditions. So we put the async function inside:
        async function fetchData() {
            try {
                const response = await api.get('/users/'+userId);

                // delays continuous execution of an async operation for 1 second.
                // This is just a fake async call, so that the spinner can be displayed
                // feel free to remove it :)
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Get the returned users and update the state.
                setUser(response.data);

                // This is just some data for you to see what is available.
                // Feel free to remove it.
                console.log('request to:', response.request.responseURL);
                console.log('status code:', response.status);
                console.log('status text:', response.statusText);
                console.log('requested data:', response.data);

                // See here to get more data.
                console.log(response);
            } catch (error) {
                console.error(`Something went wrong: \n${handleError(error)}`);
                console.error("Details:", error);
                alert("Something went wrong! See the console for details.");
            }
        }
        fetchData();
    }, []);

    let content = <Spinner/>;

    if (user) {
        content = (
            <div className="user overview">

				<FormField
                    label="picture"
                    //value={username}
                    //onChange={un => setUsername(un)}
                />

                <FormField
                    label="username"
                    value={username}
                    onChange={un => setUsername(un)}
                />

                <FormField
                    label="password"
                    value={password}
                    onChange={p => setPassword(p)}
                />

                <Button
					disabled={!username && !password}
                    width="100%"
                    onClick={() => confirm()}
                >
                    Confirm
                </Button>
                &nbsp;
                <Button
                    width="100%"
                    onClick={() => history.push(`/users/${user.map(itm => itm.id)}`)}
                >
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <BaseContainer>
		  <div className="login container">
            <div className="game form">
              <p className="inspect paragraph">
                  You could change your username and password here. (Optional)
              </p>
              {content}
			</div>
		  </div>
        </BaseContainer>
    );

};

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default Setting;
