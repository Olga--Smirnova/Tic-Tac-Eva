import "./styles.scss";
import Pilot from './Pilot';
import React, { useState, useEffect } from "react";
import { angels } from './angels-data.js';

// box
function Box({ value, face, onBoxClick, isWinningBox, winner }) {
  return (
    <button
      className={`col-3 box 
        ${isWinningBox ? "winning-box" : ""} 
        ${isWinningBox && winner === 'X' ? "pilot-winBox" : ""} 
        ${isWinningBox && winner === '0' ? "angel-winBox" : ""}`}
      onClick={onBoxClick}
    >
      {value && face ? <img src={face} alt={value} width="100" /> : value}
    </button>
  );
}

const PIECE = {
  X: 'X',
  O: '0',
  EMPTY: null,
}

const props = {
  selectedPiece: PIECE,
  startingPlayer: PIECE.X,
}

const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
  [0, 4, 8], [2, 4, 6]              // Diagonals
];


function calculateWinner(boxes) {
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (boxes[a] && boxes[a] === boxes[b] && boxes[a] === boxes[c]) {
      return {
        winner: boxes[a], //winning player: 'X' or 'O'
        winningBoxes: [a, b, c] // winning boxes combination
      };
    }
  }
  return null;
}

// Check if it's a draw (no more empty boxes left)\
//  - YES: stop the game
//  - NO: continue
//  - show the corresponding HTML
function calculateDraw(boxes) {
  return boxes.every(box => box !== null) && !calculateWinner(boxes);
}

function AngelTurnGenerator(boxes, enemyCounter) {
  const availableMoves = boxes
    .map((box, index) => (box === null ? index : null))
    .filter(index => index !== null);

  // Check next angel's winning move (the smartest angel)
  if (enemyCounter === 4) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (boxes[a] === '0' && boxes[b] === '0' && !boxes[c]) {
          return c; 
      }
      if (boxes[a] === '0' && boxes[c] === '0' && !boxes[b]) {
          return b; 
      }
      if (boxes[b] === '0' && boxes[c] === '0' && !boxes[a]) {
          return a;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (boxes[a] === 'X' && boxes[b] === 'X' && boxes[c] === null) {
          return c; 
      }
      if (boxes[a] === 'X' && boxes[c] === 'X' && boxes[b] === null) {
          return b; 
      }
      if (boxes[b] === 'X' && boxes[c] === 'X' && boxes[a] === null) {
          return a; 
      }
    }
  // Block next pilot's winning move 
  } else if (enemyCounter > 1) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (boxes[a] === 'X' && boxes[b] === 'X' && boxes[c] === null) {
          return c; 
      }
      if (boxes[a] === 'X' && boxes[c] === 'X' && boxes[b] === null) {
          return b; 
      }
      if (boxes[b] === 'X' && boxes[c] === 'X' && boxes[a] === null) {
          return a; 
      }
    }
  }
  
  // Random move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)]; // Random move
  
}



// app
function App() {
    const [pilot, setPilot] = useState(null);
    const [angel, setAngel] = useState(angels[0]);
    const [gameCounter, setGameCounter] = useState(0);
    const [enemyCounter, setEnemyCounter] = useState(1);
    const [pilotWinCounter, setPilotWinCounter] = useState(0);
    const [angelWinCounter, setAngelWinCounter] = useState(0);

    const [gameOver, setGameOver] = useState(false);
    const [isAngelNext, setAngelNext] = useState(false);
    const [boxes, setBoxes] = useState(Array(9).fill(PIECE.EMPTY));
    const [faces, setFaces] = useState(Array(9).fill(null));
    const [pilotFace, setPilotFace] = useState(null);
    const [gameStatus, setGameStatus] = useState(null);

    const playBtnsTexts = ["Play again", "Meet your next enemy", `Fight ${angel.name} again`];
    const [btnText, setBtnText] = useState(playBtnsTexts[0]); 

    const [winner, setWinner] = useState(false);
    const [winningBoxes, setWinningBoxes] = useState([]);

    // Make a move
    //  - update arrays
    //  - set the next player
    function handlePlacePiece (i) {
      let mark = boxes[i];
  
      if ( mark !== PIECE.EMPTY) {
        return;
      } 

      if (mark === PIECE.EMPTY) {
        const nextBoxes = boxes.slice();
        const nextFaces = faces.slice();

        if(isAngelNext) {
          nextBoxes[i] = PIECE.O;
          nextFaces[i] = angel.avatar;
        } else {
          nextBoxes[i] = PIECE.X;
          nextFaces[i] = pilot.avatar;
        }
        
        setBoxes(nextBoxes); 
        setFaces(nextFaces); 
        
        setWinner(calculateWinner(nextBoxes));

        const { winner, winningBoxes } = calculateWinner(nextBoxes) || {};
        const checkDraw = calculateDraw(nextBoxes);

        // Check if we have a winner after last move
        //  - YES: stop the game
        //  - NO: continue
        //  - show the corresponding DRAW HTML
        if (winner) {   
          setGameStatus((isAngelNext ? angel.name : pilot.name) + " won");
          setPilotFace(isAngelNext ? pilot.looserImg : pilot.winnerImg);
          setGameCounter(prev => prev + 1);

          if(isAngelNext) {
            setAngelWinCounter(prev => prev + 1);
          }else{
            setPilotWinCounter(prev => prev + 1);
          }
      
          setWinner(winner);
          setWinningBoxes(winningBoxes);

          return winner, winningBoxes;
        } else if (checkDraw) {
          setGameOver(true);
          setGameStatus("No one won. Try again.");
          setPilotFace(pilot.drawImg);

          setGameCounter(prevCounter => prevCounter + 1);
          return;
        } else {
          setAngelNext(!isAngelNext);   
          setGameStatus(<>{(!isAngelNext ? angel.name : pilot.name)}</>);    
        }   
      }
    };

    useEffect(() => {
      if (winner) {
        setTimeout(() => {
          setGameOver(true);
          setWinningBoxes([]);
        }, 1000);
      }
    
    }, [winner]);

    // Update button text
    useEffect(() => {
      if (gameCounter % 5 === 0 && gameCounter !== 0 && pilotWinCounter > angelWinCounter) {
        setBtnText(playBtnsTexts[1]); // Change btn text to agree fight next enemy
      }else if (gameCounter % 5 === 0 && gameCounter !== 0 && pilotWinCounter < angelWinCounter) {
        setBtnText(playBtnsTexts[2]); // Change btn text to fight this enemy again
      }
    }, [gameCounter]);

    // Angel's turn move
    useEffect(() => {
      if (isAngelNext && !gameOver && !winner) { 
        const box = AngelTurnGenerator(boxes, enemyCounter);
    
        setTimeout(() => {
          handlePlacePiece(box);
        }, 500);
      }
    }, [boxes, winner]);

    // Play again
    //  - clean up all arrays
    const togglePlayAgain = () => {
        // if next emeny
        if (gameCounter % 5 === 0 && gameCounter !== 0 && pilotWinCounter > angelWinCounter) {
          const angelIndex = Math.floor(gameCounter / 5);
          const selectedAngel = angels[enemyCounter] || null;

          setAngel(selectedAngel);
          setPilotWinCounter(0);
          setAngelWinCounter(0);
          setGameCounter(0);
          setBtnText(playBtnsTexts[0]);
          setEnemyCounter(prev => prev + 1);
        } else if (gameCounter % 5 === 0 && gameCounter !== 0 && pilotWinCounter < angelWinCounter) {
          setPilotWinCounter(0);
          setAngelWinCounter(0);
          setGameCounter(0);
          setBtnText(playBtnsTexts[0]);
        }

        setBoxes(Array(9).fill(PIECE.EMPTY));
        setFaces(Array(9).fill(null));
        setPilotFace(null);
        setGameStatus(<>{(isAngelNext ? angel.name : pilot.name)}</>);  
        setAngelNext(false);
        setGameOver(false);
    };

    
  return (
    <div className="container">
        { gameOver && gameCounter % 5 === 0 && pilotWinCounter > angelWinCounter && angel.id == 3 ? (
            <div className="row h-100 justify-content-center">
              <div className="col-12 text-center">
                <h2 className="t-red mb-0 lh-02">All angels are defeated</h2>
                <p className="text-xs t-italic text-white">Good job, { pilot.name }</p>
                <img src={pilot.winnerImg} alt={pilot.name} width="180" />
              </div>
            </div>
        ) : (
           pilot ? (
            <div className='row align-items-center'>
                <div className='col-12 col-lg-5'>
                    <div className="row align-items-center justify-content-center">
                        <div className="col-5 text-center">
                            <h1 className='text-white'>{ pilot.name }</h1>
                        </div>

                        <div className="col-2 text-center">
                            <h1 className="text-xs t-italic text-white">VS</h1>
                        </div>

                        <div className="col-5 text-center">
                            <h1 className='text-white'>{ angel.id }</h1>
                        </div>
                    </div>

                    <div className="row align-items-center">
                        <div className='col-5 text-center'>
                            <div className={`${
                                  (gameCounter % 5 === 0 && pilotWinCounter < angelWinCounter) ? 'img-crossed' : ''
                                }`}>
                                
                                { pilot.avatar ? (
                                    <img src={ pilot.avatar } alt={ pilot.name } width="160" />
                                  ) : null }
                            </div>
                            <h2 className='text-white'>{ pilotWinCounter }</h2>
                        </div>

                        <div className="col-2 text-center">
                            <h2 className="text-white">:</h2>
                        </div>

                        <div className='col-5 text-center'>
                        <div className={`${
                                  (gameCounter % 5 === 0 && pilotWinCounter > angelWinCounter) ? 'img-crossed' : ''
                                }`}>
                                <img src={ angel.avatar } alt={ angel.name } width="160" /> 
                            </div>
                            <h2 className='text-white'>{ angelWinCounter }</h2>
                        </div>
                    </div>
                </div>

                <div className='col-12 col-lg-5 offset-lg-2'>
                {gameOver && angel.id < 4 ? (
                    <div className="row h-100 justify-content-center">

                        {gameCounter % 5 === 0 ? (
                          pilotWinCounter > angelWinCounter ? (
                            <div className="col-12 text-center">
                              <h2 className='t-red mb-0 lh-02'>Congratulations!</h2>
                              <p className='text-xs t-italic text-white'>{ angel.name } defeated</p>
                              <img src={ pilot.winnerImg } alt={ gameStatus } width="180" className="mb-5" />
                            </div>
                          ) : (
                            <div className="col-12 text-center">
                              <h2 className='t-red mb-0 lh-02'>You've lost,</h2>
                              <p className='text-xs t-italic text-white'>{ pilot.name }</p>
                              <img src={ pilot.looserImg } alt={ gameStatus } width="180" className="mb-5" />
                            </div>
                          )
                        ) : (
                          <div className="col-7 d-flex flex-column align-items-center justify-content-center">  
                            <div className="col-12 text-center">
                              <p className='text-xs t-italic text-white'>{ gameStatus }</p>
                            </div>

                            { pilotFace ? (
                              <img src={ pilotFace } alt={ gameStatus } width="180" className="mb-5" />
                            ) : null}
                          </div>
                        )}

                        <div className="col-7 d-flex flex-column align-items-center justify-content-center">  
                          <button type="button" className="btn btn-danger" onClick={ togglePlayAgain }>
                              { btnText }
                          </button>
                        </div>
                    </div>

                  ) : (

                    <div>
                        
                        <div className='row justify-content-between align-items-end'>
                            <div className="col-8 pt-4">
                                <span className="title text-white">Next turn:</span>
                                <h1 className="status text-white">{gameStatus}</h1>
                            </div>
                            <div className="col-4 pt-4">
                                <h1 className="status text-white text-end">{gameCounter}/5</h1>
                            </div>
                        </div>
                       
                        
                            <div className="row justify-content-end text-center board">
                                <Box value={boxes[0]} face={faces[0]} 
                                      onBoxClick={() => handlePlacePiece(0)}
                                      isWinningBox={winningBoxes.includes(0)} 
                                      winner={winner} />
                                <Box value={boxes[1]} face={faces[1]} 
                                      onBoxClick={() => handlePlacePiece(1)}
                                      isWinningBox={winningBoxes.includes(1)}
                                      winner={winner}  />
                                <Box value={boxes[2]} face={faces[2]} 
                                      onBoxClick={() => handlePlacePiece(2)}
                                      isWinningBox={winningBoxes.includes(2)} 
                                      winner={winner} />      
                            </div>
                            <div className="row justify-content-end text-center board">
                                <Box value={boxes[3]} face={faces[3]} 
                                      onBoxClick={() => handlePlacePiece(3)}
                                      isWinningBox={winningBoxes.includes(3)} 
                                      winner={winner} />
                                <Box value={boxes[4]} face={faces[4]} 
                                      onBoxClick={() => handlePlacePiece(4)}
                                      isWinningBox={winningBoxes.includes(4)}
                                      winner={winner}  />
                                <Box value={boxes[5]} face={faces[5]} 
                                      onBoxClick={() => handlePlacePiece(5)}
                                      isWinningBox={winningBoxes.includes(5)} 
                                      winner={winner} />
                            </div>
                            <div className="row justify-content-end text-center board">
                                <Box value={boxes[6]} face={faces[6]} 
                                      onBoxClick={() => handlePlacePiece(6)}
                                      isWinningBox={winningBoxes.includes(6)}
                                      winner={winner}  />
                                <Box value={boxes[7]} face={faces[7]} 
                                      onBoxClick={() => handlePlacePiece(7)}
                                      isWinningBox={winningBoxes.includes(7)} 
                                      winner={winner} />
                                <Box value={boxes[8]} face={faces[8]} 
                                      onBoxClick={() => handlePlacePiece(8)}
                                      isWinningBox={winningBoxes.includes(8)}
                                      winner={winner}  />
                            </div>
                       
                    </div>
                    
                  ) }

                </div>
            </div>

        ):(
          <div className='row justify-content-center'>
              <div className="col-12  text-center">
                  <h1 className="text-white">Choose your pilot</h1>
                  <div className='row justify-content-between align-items-center'>
                      <Pilot setPilot={setPilot} setGameStatus={setGameStatus} />
                  </div>
              </div>
          </div>
        )
      )}
    </div>
  );
}



export default App;
