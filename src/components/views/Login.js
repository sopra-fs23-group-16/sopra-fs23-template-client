import React, {useState} from 'react';
import {api, handleError} from 'helpers/api';
import User from 'models/User';
import {useHistory} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/Login.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {doTouristCreation} from "./Tourist";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const FormFieldUsername = props => {
  return (
    <div className="login field">
      <label className="login label">
        {props.label}
      </label>
      <input
        className="login input"
        placeholder="Enter your username here"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormFieldUsername.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

const FormFieldPassword = props => {
  return (
    <div className="login field">
      <label className="login label">
        {props.label}
      </label>
      <input
        type = "password"
        className="login input"
        placeholder="Enter your password here"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormFieldPassword.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

const Login = props => {
  const history = useHistory();  
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [userList, setUserList] = useState([]);
  const [timeOut, setTimeOut] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [warnMessage, setWarnMessage] = useState(null);

  const doLogin = async () => {
    try {
      const requestBody = JSON.stringify({username, password: password});
      const response = await api.post('/login', requestBody);

      const user = new User(response.data);

      localStorage.setItem('token', user.token);
	  localStorage.setItem('loggedInUser', user.id);

      history.push(`/game`);
    } catch (error) {
      alert(`Login failed: \n${handleError(error)}`);
	  history.push(`/register`);
    }
  };
  
  const doRegister = async () => {
    try {
      history.push(`/register`);
    } catch (error) {
      alert(`Register failed: \n${handleError(error)}`);
    }
  };

    // Tourist will be automatically created, and direct to game mode page
    const doTouristLogin = () => {
        try {
            const newUserGanerated = doTouristCreation();
            setUserList([...userList, newUserGanerated]);

            // Method 1:
            // alert("Dear tourist, You will login the game with tourist mode! you could also do registration to save the game record! ヽ(｡◕‿◕｡)ﾉﾟ</p>");

            // Method 2:
            // const myWindow = window.open("", "", "width=400,height=150,textColor=Orange");
            // myWindow.document.title = "Warm Note";
            // myWindow.document.write("<p>Dear tourist,</p> \n <p>You will login the game with tourist mode!</p> \n <p>  You could also do registration to save the game record! ヽ(｡◕‿◕｡)ﾉﾟ</p>");
            // myWindow.document.body.style.background = "#262632";
            // myWindow.document.body.style.textColor = "White";

            setWarnMessage("You will login the game with tourist mode! You could also do registration to save the game record! ヽ(｡◕‿◕｡)ﾉﾟ");

            setTimeout(() => {
                setTimeOut(1);
                //myWindow.close();

            }, 2000);

            setTimeout(() => {
                history.push(`/dashboard?mode=tourist`);
            }, 2000);


        } catch (error) {
            alert(`Register failed: \n${handleError(error)}`);
        }
    };

  return (
    <BaseContainer>
      <div className="login container">
      <h2 className="login title">Please login into your account!</h2>
        <div className="login form">
          <FormFieldUsername
            label="Username"
            value={username}
            onChange={un => setUsername(un)}
          />
          <FormFieldPassword
            label="Password"
            value={password}
            onChange={n => setPassword(n)}
          />
          <div className="login button-container">
          <Button
          disabled={!username || !password}
          width="80%"
          onClick={() => doLogin()}
        >
          Login
        </Button>
    </div>
    <div className="login button-container">
        <Button
          width="80%"
          onClick={() => doRegister()}
        >
          Register
        </Button>
    </div>

            <div className="login button-container">
                <Button
                    width="80%"
                    onClick={() => doTouristLogin()}
                >
                    Tourist Mode
                </Button>
            </div>

            {errorMessage &&
                <div className="login errorMessage">{errorMessage.response.data.message}</div>
            }

            {warnMessage &&
                <div className="login warnMessage">{warnMessage}</div>
            }

        </div>
      </div>
    </BaseContainer>
  );
};

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default Login;