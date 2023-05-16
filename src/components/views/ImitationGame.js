import React, { useRef, useEffect, useState } from 'react';
import {handleError, client } from 'helpers/api';
import {useParams} from 'react-router-dom';
import 'styles/views/ChoiceGame.scss';
import BaseContainer from "components/ui/BaseContainer";
import dog from "image/dog.png";
import cat from "image/cat.jpg";
import seelion from "image/seelion.jpg";
import owl from "image/owl.jpg";
import cattle from "image/cattle.jpg";
import recognizeHandwriting from "../../helpers/recognizeHandwriting";
import 'styles/views/ImitationGame.scss';

const ImitationGame = props => {

	const canvasRef = useRef(null);
	const [lines, setLines] = useState([[],[]]);
	const [isDrawing, setIsDrawing] = useState(false);
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		const preventTouchScroll = (e) => {
			if (e.target === canvas) {
				e.preventDefault();
			}
		};
		document.addEventListener("touchmove", preventTouchScroll, { passive: false });
		return () => {
			document.removeEventListener("touchmove", preventTouchScroll);
		};
	}, []);

	const { roomID } = useParams();
	const [players, setPlayers] = useState([]);
	const playerNames = players.map(player => player.playerName)
	const playerIcons = players.map(player => player.icon);
	const [canvasSize,setcanvasSize] = useState([])
	const strokeHistory = [[],[]];

	const questionList = JSON.parse(localStorage.getItem('questionList'));
	if (questionList === null) {
		alert("Game crashed! Retrieve questions failed!")
	}
	const round = localStorage.getItem('round');
	if (round === null) {
		alert("Game crashed! Round is null!")
	}
	const currentQuestion = questionList[round - 1];
	console.log(currentQuestion);

	const requestBody = JSON.stringify({ roomID });
	
	function defineIcon(icon){
		if (icon === "dog") {
			return dog;
		} else if (icon === "cat") {
			return cat;
		} else if (icon === "seelion") {
			return seelion;
		} else if (icon === "cattle") {
			return cattle;
		} else if (icon === "owl") {
			return owl;
		}
	}

	useEffect(() => {
		
		// effect callbacks are synchronous to prevent race conditions. So we put the async function inside:
		async function stompConnect() {
			try {
				if (!client['connected']) {
					client.connect({}, function () {
						console.log('connected to stomp');
						client.subscribe("/topic/multi/rooms/" + roomID + "/info", function (response) {
							const room = response.body;
							const roomparse = JSON.parse(room);
							//const roomcode = roomparse["roomCode"]
							const players = roomparse["players"]
							console.log(players);
							console.log(roomparse);
							//setRoomcode(roomcode);
							setPlayers(players);
						});
						setTimeout(function () {
							client.send("/app/multi/rooms/" + roomID + "/info", {}, requestBody)
						}, 500);
						client.subscribe('/topic/multi/rooms/' + roomID + '/join', function (response) {
							const room = response.body;
							const roomparse = JSON.parse(room);
							console.log(roomparse);
						});
					});
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
				client.disconnect(function () {
					console.log('disconnected from stomp');
				});
			}
		};
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		canvas.width = window.innerWidth * 0.25;
		canvas.height = canvas.width;
		setcanvasSize({width:canvas.width, height:canvas.height})
		const context = canvas.getContext("2d");
		context.lineCap = "round";
		context.strokeStyle = "black";
		context.lineWidth = 5;
		/*		context.strokeRect(0, 0, canvas.width, canvas.height);*/

		lines.forEach(line => {
			context.beginPath();
			line.forEach((point, index) => {
				if (index === 0) {
					context.moveTo(point.x, point.y);
				} else {
					context.lineTo(point.x, point.y);
					context.stroke();
				}
			});
		});
	}, [lines]);

	const startDrawing = ({ nativeEvent }) => {
		const { offsetX, offsetY } = nativeEvent;
		setLines(prevState => [...prevState, [{ x: offsetX, y: offsetY }]]);
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		context.beginPath();
		context.moveTo(offsetX, offsetY);
		setIsDrawing(true);
	};

	function saveStrokes(lines) {
		for (const line in lines) {
			//console.log("line",line)
			for (const sample in lines[line]){
				//console.log("sample",lines[line][sample])
				strokeHistory[0].push(lines[line][sample].x);
				strokeHistory[1].push(lines[line][sample].y)
			}
		}
		console.log("Save strokes complete:",strokeHistory)
	}

	const finishDrawing = () => {
		setLines(prevState => {
			const lastIndex = prevState.length - 1;
			const lastLine = prevState[lastIndex];
			return [
				...prevState.slice(0, lastIndex),
				[...lastLine],
			];
		});
		setIsDrawing(false);
	};

	const draw = ({ nativeEvent }) => {
		if (!isDrawing) {
			return;
		}
		const { offsetX, offsetY } = nativeEvent;
		setLines(prevState => {
			const lastIndex = prevState.length - 1;
			const lastLine = prevState[lastIndex];
			return [
				...prevState.slice(0, lastIndex),
				[...lastLine, { x: offsetX, y: offsetY }],
			];
		});
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		context.lineTo(offsetX, offsetY);
		context.stroke();
	};

	const undo = () => {
		setLines(prevState => prevState.slice(0, -1));
	};

	const clearCanvas = () => {
		setLines([]);
	};

	const saveCanvasImgs = () => {
		const canvas = document.getElementById('imitationCanvas');
		canvas.toBlob((blob) => {
			const reader = new FileReader();
			reader.readAsArrayBuffer(blob);
			reader.onloadend = () => {
				const buffer = reader.result;

				const loggedInUserID = localStorage.getItem("loggedInUser");
				// convert the ArrayBuffer to a typed array
				const byteArr = new Uint8Array(buffer);
				const byteArrString = String.fromCharCode.apply(null, byteArr);
				const byteArrString64 = btoa(byteArrString);
				const round = parseInt(localStorage.getItem("round"));

				console.log("Player is sending img:", loggedInUserID);
				console.log("The img buffer string 64 is sending :"+ byteArrString64); // Object ArrayBuffer

				const requestgetready = {
					userID: loggedInUserID,
					imitationBytes: byteArrString64,
					round: round
				};
				client.send("/app/multi/rooms/"+ roomID + "/players/imitations",{}, JSON.stringify(requestgetready))
			};
		}, 'image/png'); // Change the format here to jpeg, bmp, etc.
	};

	const submitDrawing = () =>{
		saveStrokes(lines);
		console.log("canvasSize",canvasSize)
		console.log("strokehIS",strokeHistory)

		if(strokeHistory[0].length === 0 &&  strokeHistory[1].length === 0){
			localStorage.setItem("roundPoints", 0);
		} else{
			recognizeHandwriting(canvasSize,[strokeHistory],10,handleResponse)
		}

		// process cancas strokes as bytes
		saveCanvasImgs();
		setTimeout(submitScore(), 50);

		// // Submit system score
		// var countdown = 1;
		// var timer = setInterval(function() {
		// 	countdown--;
		//
		// 	if (countdown <= 0) {
		// 		clearInterval(timer);
		// 		setTimeout(submitScore(), 50);
		// 	}
		// }, 1000);
	}

	function evaluateWriting(response, character) {
		let answer  = character;
		let candidates = response;
		let score = 10;

		for (let i= 0;i < candidates.length; i++) {
			if(i!==0 && i% 3===0){
				score = score - 2;
			}
			if (candidates[i] === answer){
				break;
			}
		}
		return score;
	}

	function handleResponse(response) {
		if (response instanceof Error) {
			console.error('Error:', response.message);
			// Handle the error in some way, such as displaying a message to the user or logging it
		} else {
			console.log('Response:', response);
			const score = evaluateWriting(response,currentQuestion.character);
			localStorage.setItem("roundPoints", score);
			console.log("Score",score)
			// Handle the response data in some way, such as updating the UI or storing it in a database

		}
	}

	const submitScore = () => {
		///////////////////////////////////////////////
		//    make sure it is the right userID       //
		///////////////////////////////////////////////
		const userID = localStorage.getItem('loggedInUser')
		let systemScore = 0;
		if (localStorage.getItem("roundPoints")) {
			systemScore = parseInt(localStorage.getItem("roundPoints"));
			setTimeout(function () {
				console.log("roundPoints", systemScore);
			}, 50);
		}
		console.log("Submitted systemscore is " + systemScore);
		const requestBody = {userID,scoreBoard: {systemScore}};
		client.send("/app/multi/rooms/" + roomID + "/players/scoreBoard", {}, JSON.stringify(requestBody))
		setDisabled(true);
	}

	window.addEventListener("load", function() {

		var countdown = 8 + parseInt(currentQuestion["level"]) * 2; // time adjust regarding difficult level
		var countdownElement = document.getElementById("countdown");

		var timer = setInterval(function() {
			countdown--;
			countdownElement.innerHTML = countdown + "s";

			if (countdown <= 0) {
				clearInterval(timer);
				submitDrawing();
				// setTimeout(submitScore(), 50);
				setTimeout(function () {
					window.location.href = `/game/${roomID}/imitationvoting`;
				}, 500);
			}
		}, 1000);
	});

	return (
		<BaseContainer>
			<div className="choicegame container">
				<div className="choicegame col">

					{players.length > 0 ? (
						<div className="choicegame card">
							<img src={defineIcon(playerIcons[0])} alt="player1" style={{ width: '80%', height: 'auto', display: 'block', margin: 'auto' }} />
						</div>) : null}
					{playerNames.length > 0 ? (
						<div className="choicegame label"> {playerNames[0]}</div>
					) : null}
					{players.length > 1 ? (
						<div className="choicegame card">
							<img src={defineIcon(playerIcons[1])} alt="player1" style={{ width: '80%', height: 'auto', display: 'block', margin: 'auto' }} />
						</div>) : null}
					{playerNames.length > 1 ? (
						<div className="choicegame label"> {playerNames[1]}</div>
					) : null}

					{players.length > 2 ? (
						<div className="choicegame card">
							<img src={defineIcon(playerIcons[2])} alt="player1" style={{ width: '80%', height: 'auto', display: 'block', margin: 'auto' }} />
						</div>) : null}
					{playerNames.length > 2 ? (
						<div className="choicegame label"> {playerNames[2]}</div>
					) : null}

					{players.length > 3 ? (
						<div className="choicegame card">
							<img src={defineIcon(playerIcons[3])} alt="player1" style={{ width: '80%', height: 'auto', display: 'block', margin: 'auto' }} />
						</div>) : null}
					{playerNames.length > 3 ? (
						<div className="choicegame label"> {playerNames[3]}</div>
					) : null}

					{players.length > 4 ? (
						<div className="choicegame card">
							<img src={defineIcon(playerIcons[4])} alt="player1" style={{ width: '80%', height: 'auto', display: 'block', margin: 'auto' }} />
						</div>) : null}
					{playerNames.length > 4 ? (
						<div className="choicegame label"> {playerNames[4]}</div>
					) : null}

					{players.length > 5 ? (
						<div className="choicegame card">
							<img src={defineIcon(playerIcons[5])} alt="player1" style={{ width: '80%', height: 'auto', display: 'block', margin: 'auto' }} />
						</div>) : null}
					{playerNames.length > 5 ? (
						<div className="choicegame label"> {playerNames[5]}</div>
					) : null}

				</div>
				<div className="choicegame form">
				<div className="choicegame col">
					<center>
						<div id="countdown" className="imitationgame timer">
						</div>
						<br />
						<br />
						<div className="imitationgame sumitbox"> 
						<button className="imitationgame button-submit" disabled={disabled} onClick={undo}>Undo</button>
						<button className="imitationgame button-submit" disabled={disabled} onClick={clearCanvas}>Clear</button>
						<button className="imitationgame button-submit" disabled={disabled} onClick={submitDrawing}>{disabled?"Submitted":"Submit"}</button>
						</div>
					</center>
					<div className="imitationgame canvas-container">
						<center >
							<canvas id = 'imitationCanvas'
								onMouseDown={startDrawing}
								onMouseUp={finishDrawing}
								onMouseMove={draw}
								onTouchStart={(e) => {
									const touch = e.touches[0];
									const { left, top } = canvasRef.current.getBoundingClientRect();
									const touchX = touch.clientX - left;
									const touchY = touch.clientY - top;
									startDrawing({ nativeEvent: { offsetX: touchX, offsetY: touchY } });
								}}
								onTouchEnd={finishDrawing}
								onTouchMove={(e) => {
									const touch = e.touches[0];
									const { left, top } = canvasRef.current.getBoundingClientRect();
									const touchX = touch.clientX - left;
									const touchY = touch.clientY - top;
									draw({ nativeEvent: { offsetX: touchX, offsetY: touchY } });
								}}
								ref={canvasRef}
							></canvas>

						</center>
					</div>
				</div>
				</div>
			</div>
		</BaseContainer>
	);
};

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default ImitationGame;