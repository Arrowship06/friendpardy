import * as React from "react";
import "../style.css";
import PlayAudio from "../PlayAudio";
import theme from "../assets/audio/theme.mp3";
import { Socket } from "socket.io-client";
import IPlayer from "back-end/interfaces/IPlayer";
import HostQuestionnaireView from "./HostQuestionnaireView";

interface IQuestionnaireProps {
  socket: Socket;
  gameId: number;
  playersInGame: IPlayer[];
}

function getPlayerNamesForState(players: IPlayer[], state: string) {
  return players.filter(p => p.playerState.state === state).map(p => p.name);
}

export default function HostQuestionnaire(props: IQuestionnaireProps) {
  const { socket, gameId, playersInGame } = props;
  const donePlayersStart = getPlayerNamesForState(playersInGame, 'submitted-questionnaire-waiting');
  const waitingPlayersStart = getPlayerNamesForState(playersInGame, 'filling-questionnaire');

  const [donePlayers, setDonePlayers] = React.useState<string[]>(donePlayersStart);
  const [waitingPlayers, setWaitingPlayers] = React.useState<string[]>(waitingPlayersStart);  

  React.useEffect(() => {
    function onStatusReceived(playerStatusList: any){
      setDonePlayers(playerStatusList[0]);
      setWaitingPlayers(playerStatusList[1]);
    }

    socket.on("update-host-view", onStatusReceived);

    return () => {
      socket.off("update-host-view", onStatusReceived);
    };
  }, []);
  
  return (
    <>
      <PlayAudio src={theme} loop={true} />
      <HostQuestionnaireView
        donePlayers={donePlayers}
        waitingPlayers={waitingPlayers}
        gameId={gameId}
        socket={socket}
      />
    </>
  );
}
