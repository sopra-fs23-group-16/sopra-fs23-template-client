import React, {useEffect, useState} from 'react';
import {api, handleError, client} from 'helpers/api';
//import User from 'models/User';
import {useHistory} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/NormalWaitingRoom.scss';
import BaseContainer from "components/ui/BaseContainer";
//import PropTypes from "prop-types";
import { useParams } from 'react-router-dom';
import dog from 'image/dog.png';

const NormalWaitingRoom = props => {
	const history = useHistory();  
    const {roomID} = useParams();
	const [players, setPlayers] = useState([]);
	const playerNames = players.map(player => player.playerName)

	const userID = localStorage.getItem("loggedInUser");
	const playerToUpdate = players.find(player => player.userID == Number(userID));
	
	const requestBody = JSON.stringify({ roomID });

	useEffect(() => {
        // effect callbacks are synchronous to prevent race conditions. So we put the async function inside:
        async function stompConnect() {
            try {
                if (!client['connected']) {
                    client.connect({}, function (frame) {
						console.log('connected to stomp');
						client.subscribe("/topic/multi/rooms/"+ roomID +"/info", function (response) {
							const room = response.body;
							const roomparse = JSON.parse(room);
							const players = roomparse["players"]

							console.log(roomparse);
							setPlayers(players);						
						});
						setTimeout(function () {
							client.send("/app/multi/rooms/"+ roomID + "/info",{}, requestBody)
						},100);
						client.subscribe('/topic/multi/rooms/' + roomID + '/drop', function (response) {
							const room = response.body;
							const roomparse = JSON.parse(room);
							console.log(roomparse);	

							const players = roomparse["players"]
							setPlayers(players);		
						
							const userIDs = players.map(player => player.userID)
							let userId = localStorage.getItem("loggedInUser");
							if (!userIDs.includes(userId)) {
								alert("You have been kicked out!");
								window.location.href = "/lobby";
							}
						});
						client.subscribe('/topic/multi/games/' + roomID + '/questions', function (response) {
							// clear
							localStorage.removeItem('round');
							localStorage.removeItem('questionList');

							const questionList = response.body;
							const qListparse = JSON.parse(questionList);
							// initialise
							localStorage.setItem('round', 1)
							localStorage.setItem('questionList', JSON.stringify(qListparse));

							window.location.href = '/games/multiplechoice/' + roomID;

						});
					});
					//console.log("2 the client is ",client['connected'])
                }
            } catch (error) {
                console.error(`Something went wrong: \n${handleError(error)}`);
                console.error("Details:", error);
                alert("Something went wrong! See the console for details.");
            }
        }
		stompConnect();

		// return a function to disconnect on unmount
		return function cleanup() {
			if (client && client['connected']) {
				//controller.abort();
				client.disconnect(function () {
					console.log('disconnected from stomp');
				});
			}
		};
    }, []);
	
	const getReady = () => {
		const loggedInUserID = localStorage.getItem("loggedInUser");
  		const playerToUpdate = players.find(player => player.userID == Number(loggedInUserID));

		const requestgetready = {
			userID: playerToUpdate.userID,
			ready: true
		};
		client.send("/app/multi/rooms/"+ roomID + "/players/status",{}, JSON.stringify(requestgetready))
    };


	const cancelReady = () => {
		const loggedInUserID = localStorage.getItem("loggedInUser");
  		const playerToUpdate = players.find(player => player.userID == Number(loggedInUserID));
		
		const requestcancelready = {
			userID: playerToUpdate.userID,
			ready: false
		};
	
		client.send("/app/multi/rooms/"+ roomID + "/players/status",{}, JSON.stringify(requestcancelready))
    };

	const exitRoom = () => {
		window.location.href = "/lobby";
    };

	return (
		<BaseContainer>
			<div  className="normalwaiting container">
			<div className="normalwaiting col">
				{players.length > 0 ? (
					<div className="normalwaiting card">
						<img src={dog} alt="player1" style={{ width: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
					</div>) : null}
					{playerNames.length > 0 && players[0]?.ready ? (
						<div className="normalwaiting label">&#x2705; {playerNames[0]}</div>
						) : (playerNames.length > 0 && !players[0]?.ready ? (
						<div className="normalwaiting label">&#x274C; {playerNames[0]}</div>
					) : null)}
				{players.length > 1 ? (
					<div className="normalwaiting card">
						<img src={dog} alt="player1" style={{ width: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
					</div>) : null}
					{playerNames.length > 1 && players[1]?.["ready"] ? (
						<div className="normalwaiting label">&#x2705; {playerNames[1]}</div>
						) : (playerNames.length > 1 && !players[1]?.ready ? (
						<div className="normalwaiting label">&#x274C; {playerNames[1]}</div>
					) : null)}
				{players.length > 2 ? (	
					<div className="normalwaiting card">
						<img src={dog} alt="player1" style={{ width: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
					</div>) : null}
					{playerNames.length > 2 && players[2]?.ready ? (
						<div className="normalwaiting label">&#x2705; {playerNames[2]}</div>
						) : (playerNames.length > 2 && !players[2]?.ready ? (
						<div className="normalwaiting label">&#x274C; {playerNames[2]}</div>
					) : null)}
				{players.length > 3 ? (
					<div className="normalwaiting card">
						<img src={dog} alt="player1" style={{ width: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
					</div>) : null}
					{playerNames.length > 3 && players[3]?.ready ? (
						<div className="normalwaiting label">&#x2705; {playerNames[3]}</div>
						) : (playerNames.length > 3 && !players[3]?.ready ? (
						<div className="normalwaiting label">&#x274C; {playerNames[3]}</div>
					) : null)}
				{players.length > 4 ? (
					<div className="normalwaiting card">
						<img src={dog} alt="player1" style={{ width: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
					</div>) : null}
					{playerNames.length > 4 && players[4]?.ready ? (
						<div className="normalwaiting label">&#x2705; {playerNames[4]}</div>
						) : (playerNames.length > 4 && !players[4]?.ready ? (
						<div className="normalwaiting label">&#x274C; {playerNames[4]}</div>
					) : null)}

				{players.length > 5 ? (
					<div className="normalwaiting card">
						<img src={dog} alt="player1" style={{ width: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
					</div>) : null}
					{playerNames.length > 5 && players[5]?.ready ? (
						<div className="normalwaiting label">&#x2705; {playerNames[5]}</div>
						) : (playerNames.length > 5 && !players[5]?.ready ? (
						<div className="normalwaiting label">&#x274C; {playerNames[5]}</div>
					) : null)}
				{/* {players.length > 6 ? (
					<div className="normalwaiting card">
						<img src={dog} alt="player1" style={{ width: '80%', height: 'auto', display: 'block', margin: 'auto' }} />
					</div>) : null}
					{playerNames.length > 6 && players[6]?.ready ? (
						<div className="normalwaiting label">&#x2705; {playerNames[6]}</div>
						) : (playerNames.length > 6 && !players[6]?.ready ? (
						<div className="normalwaiting label">&#x274C; {playerNames[6]}</div>
					) : null)} */}
				</div>
				<div className="normalwaiting col">
				<div className="normalwaiting form">
					<center>
					<div className="normalwaiting button-container">
				<Button
					width="15%"
					onClick={() => getReady()}
					>
					Get Ready
				</Button>
				</div>
				<div className="normalwaiting button-container">
				<Button
					width="15%"
					onClick={() => cancelReady()}
					>
					Cancel Ready
				</Button>
				</div>
				<div className="normalwaiting button-container">
				<Button
					width="15%"
					onClick={() => exitRoom()}
					>
					Exit Room
				</Button>
				</div>
				</center>
				</div>
			</div>
			{/* <div className="normalwaiting col">
					<div className="normalwaiting card-rule">
						Game Rule
					</div>
				</div> */}
			</div>
		</BaseContainer>
	);
};

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default NormalWaitingRoom;