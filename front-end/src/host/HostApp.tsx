import React from 'react';
import HostLobby from './HostLobby';
import { Socket } from 'socket.io-client';
import HostOpen from './HostOpen';
import HostQuestionnaire from './HostQuestionnaire';
import HostPreQuiz from './HostPreQuiz';
import HostShowQuestion from './HostShowQuestion';
import IQuizQuestion from 'back-end/interfaces/IQuizQuestion';
import IGame from 'back-end/interfaces/IGame';
import HostShowAnswer from './HostShowAnswer';

interface IHostProps {
  socket: Socket
}

export default function HostApp(props: IHostProps) {
  const gameIdFromStorage = Number(localStorage.getItem('game-id')) || -1;
  const [gameId, setGameId] = React.useState<number>(gameIdFromStorage);
  const [gameState, setGameState] = React.useState<string>('init');
  const [quizQuestions, setQuizQuestions] = React.useState<IQuizQuestion[]>([]);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = React.useState<number>(-1);
  const [quizQuestionGuesses, setQuizQuestionGuesses] = React.useState([]);

  const [loaded, setLoaded] = React.useState<boolean>(false);
  const { socket } = props;

  if (!loaded) {
    socket.emit('host-load', gameIdFromStorage);
  }

  React.useEffect(() => {
    function onLoadSuccess(data: IGame & { quizQuestionGuesses }) {
      console.log(data);
      setLoaded(true);
      setGameId(data.id);
      setGameState(data.gameState.state);
      setQuizQuestions(data.quizQuestions);
      setCurrentQuizQuestionIndex(data.currentQuestionIndex);
      setQuizQuestionGuesses(data.quizQuestionGuesses);
    }

    function onOpenSuccess(idFromServer: number) {
      setGameId(idFromServer);
      localStorage.setItem('game-id', `${idFromServer}`);
      setGameState('lobby');
    }
  
    socket.on('host-open-success', onOpenSuccess);
    socket.on('host-load-success', onLoadSuccess);
    socket.on('host-next', onLoadSuccess);

    return () => {
      socket.off('host-open-success', onOpenSuccess);
      socket.off('host-load-success', onLoadSuccess);
      socket.off('host-next', onLoadSuccess);
    }
  }, [gameId, setGameId, gameState, setGameState]);

  function getElementForState(state: string) {
    if (state === 'lobby') {
      return <HostLobby socket={socket} gameId={gameId} />;
    } else if (state === 'questionnaire') {
      return <HostQuestionnaire />;
    } else if (state === 'pre-quiz') {
      return <HostPreQuiz />;
    } else if (state === 'showing-question') {
      const currentQuizQuestion: IQuizQuestion = quizQuestions[currentQuizQuestionIndex];
      const quizQuestionOptions = currentQuizQuestion.optionsList;
      const quizQuestionText = currentQuizQuestion.text;
      const quizQuestionPlayerName = currentQuizQuestion.playerName;

      return <HostShowQuestion options={quizQuestionOptions} questionText={quizQuestionText} playerName={quizQuestionPlayerName} />;
    } else if (state === 'showing-answer') {
      const currentQuizQuestion: IQuizQuestion = quizQuestions[currentQuizQuestionIndex];
      const quizQuestionOptions = currentQuizQuestion.optionsList;
      const quizQuestionText = currentQuizQuestion.text;
      const quizQuestionPlayerName = currentQuizQuestion.playerName;
      const correctAnswerIndex = currentQuizQuestion.correctAnswerIndex;

      return <HostShowAnswer
        options={quizQuestionOptions}
        questionText={quizQuestionText}
        playerName={quizQuestionPlayerName}
        correctAnswerIndex={correctAnswerIndex}
        playerGuesses={quizQuestionGuesses}
      />;
    } else {
      return <HostOpen socket={socket} />;
    }
  }

  return (
    <>
    <h1 style={{color: 'darkblue'}}>Friendpardy</h1>
      {getElementForState(gameState)}
    </>
  );
}
