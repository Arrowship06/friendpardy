import * as React from "react";
import "../style.css";
import { Button, Paper, Grid } from "@mui/material";
import { Socket } from "socket.io-client";
import Speak from "../Speak";
import { pickOne } from "../util";

interface IShowQuestionProps {
  playerName: string;
  questionText: string;
  options: string[];
  socket: Socket;
  gameId: number;
  timePerQuestion: number;
  handsFreeMode: boolean;
}

function HostShowQuestion(props: IShowQuestionProps) {
  const {
    options,
    questionText,
    playerName,
    socket,
    gameId,
    timePerQuestion,
    handsFreeMode,
  } = props;

  const [timerStarted, setTimerStarted] = React.useState<boolean>(false);

  function Timer(props) {
    const started = props.started;
    const [counter, setCounter] = React.useState(timePerQuestion);
    React.useEffect(() => {
      if (started && counter > 0) {
        setTimeout(() => setCounter(counter - 1), 1000);
      }
    }, [counter]);
    return (
      <div className="dot">
        <div className="timer">
          <div className="timeNumber">{started ? counter : "⌛"}</div>
        </div>
      </div>
    );
  }

  function interpolatePlayerNameInQuestionText() {
    const [part1, part2] = questionText.split("<PLAYER>");
    return (
      <p className="question">
        {part1}
        <b>{playerName}</b>
        {part2}
      </p>
    );
  }

  function quizText() {
    const [part1, part2] = questionText.split("<PLAYER>");
    var res = "";
    res += part1 + `"${playerName}"` + part2 + " .... is it ";
    for (var i = 0; i < options.length; i++) {
      if (i == options.length - 1) {
        res += `or "${options[i]}"?`;
      } else {
        res += `"${options[i]}", `;
      }
    }

    const instructions = [
      " Answer on your devices now.",
      " Give it your best guess.",
      " What do you think?",
      " Hurry up and answer.",
      " Go ahead and answer now."
    ];

    res += pickOne(instructions);
    return res;
  }

  function startTimer() {
    setTimerStarted(true);
    socket.emit('host-start-quiz-timer', gameId );
  }

  socket.on('start-timer-success', () => setTimerStarted(true));

  function onTimerSkipBtn() {
    socket.emit("timer-skip", gameId);
  }

  return (
    <>
      <Speak text={quizText()} cloud={true} callback={startTimer} />
      <Timer started={timerStarted} />
      {interpolatePlayerNameInQuestionText()}
      <ul className="ul">
        {options.map((o: String, i: number) => (
          <Paper elevation={3} className="paper">
            <li className="answer" key={i}>
              {o}
            </li>
          </Paper>
        ))}
      </ul>
      <div>
        {!handsFreeMode? 
          <Button
            className="button"
            variant="contained"
            disabled={timerStarted? false : true}
            sx={{
              bgcolor:
                getComputedStyle(document.body).getPropertyValue("--accent") +
                ";",
              m: 2,
            }}
            onClick={onTimerSkipBtn}
          >
            Show Answers
          </Button> : ''
        }
      </div>
    </>
  );
}

export default React.memo(HostShowQuestion);
