// Importing necessary dependencies from 'react'
import React, { useState, useEffect, useCallback } from 'react';
// Importing styles from App.css
import './App.css';
// Using the use-react-countries JS library for list of country names and infomration
import { useCountries } from 'use-react-countries';

// An array of URLs to dictate the hangman image progression
const hangmanStages = [
  'https://www.oligalma.com/downloads/images/hangman/hangman/4.jpg',
  'https://www.oligalma.com/downloads/images/hangman/hangman/5.jpg',
  'https://www.oligalma.com/downloads/images/hangman/hangman/6.jpg',
  'https://www.oligalma.com/downloads/images/hangman/hangman/7.jpg',
  'https://www.oligalma.com/downloads/images/hangman/hangman/8.jpg',
  'https://www.oligalma.com/downloads/images/hangman/hangman/9.jpg',
  'https://www.oligalma.com/downloads/images/hangman/hangman/10.jpg',
];

//Splitting all 26 letters into array of each letter. Used to build on screen keyboard
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Main functional component for the app
function App() {
  const { countries } = useCountries();
  // State for currently selected country
  const [selectedCountry, setSelectedCountry] = useState('');
  // State for storing guessed letters
  const [guessedLetters, setGuessedLetters] = useState([]);
  // State for tracking the number of mistakes
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);
  // State for setting the content of three buttons
  const [hintContent, setHintContent] = useState('');
  // State to determine if the game is over
  const [gameOver, setGameOver] = useState(false);
  // State for gameMessage
  const [gameMessage, setGameMessage] = useState('');

  // Function to handle the guesses of the player
  const handleGuess = useCallback(
    (letter) => {
      // If statement to determine if game is over or letter is already guessed
      if (guessedLetters.includes(letter) || !letter || gameOver) return;
      // A new array of guessed letters which help disable the button
      const newGuessedLetters = [...guessedLetters, letter];
      // Increment mistakes if the guess is incorrect
      const newMistakes = !selectedCountry.includes(letter)
        ? mistakes + 1
        : mistakes;

      // Updating the guessed letters state
      setGuessedLetters(newGuessedLetters);
      // Updating the mistakes state
      setMistakes(newMistakes);

      // Updating the word after a guess has been made
      const updatedWord = displayWord(selectedCountry, newGuessedLetters);
      // Checking if there are no more blank spaces
      const winCondition = !updatedWord.includes('_');
      // Ensuring that the number of hangman image stages matches the number of mistakes
      const loseCondition = newMistakes >= hangmanStages.length - 1;

      // An if statement to determine which ending a user should see based on game performance
      if (loseCondition) {
        // Updating useState
        setGameOver(true);
        setGameMessage(`Game Over! The correct answer was ${selectedCountry}`);
      } else if (winCondition) {
        // Updating useState
        setGameOver(true);
        setGameMessage('Congratulations! You won!');
      }
    },
    [guessedLetters, gameOver, selectedCountry, mistakes]
  );

  // useEffect hook to handle input from local keyboards
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only letter keys can produce input
      if (event.keyCode >= 65 && event.keyCode <= 90) {
        // Modifies the input to upperCase, in case of different computer keyboards
        const letter = event.key.toUpperCase();
        // Calling handleGuess method to account for new input
        handleGuess(letter);
      }
    };

    // Adding eventListner
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleGuess]);

  // Reset the game when countries string is loaded
  useEffect(() => {
    if (countries.length > 0) {
      resetGame();
    }
  }, [countries]);

  // Function to reset the game as well as all the UseStates
  const resetGame = () => {
    // Generate a random index where min is 0 and max is number of countries
    // Useing two Math.random() to ensure chance of repetition is limited
    const randomIndex = Math.floor(
      Math.random() * Math.random() * countries.length
    );
    // Select a country at random
    const randomCountry = countries[randomIndex];
    // Convert to upperCase to ensure that all the letters match
    setSelectedCountry(randomCountry.name.toUpperCase());
    // Reset all the UseStates
    setGuessedLetters([]);
    setMistakes(0);
    setShowHint(false);
    setHintContent('');
    setGameOver(false);
    setGameMessage('');
  };

  // Function to display the current state of the guessed word
  const displayWord = (country, guesses) =>
    country
      // Split the country's name into letters
      .split('')
      .map((letter) =>
        // Mapping each letter and updating in case it has been guessed.
        // By default, any spaces are set to hyphen
        letter === ' ' ? '-' : guesses.includes(letter) ? letter : '_'
      )
      // joining the letters back into a string
      .join(' ');

  // Function to handle displaying hints based on the type requested
  const helpButtons = (type) => {
    // Ensures the hint is visible
    setShowHint(true);
    // Find the current country's data using instructions from library
    const country = countries.find(
      (c) => c.name.toUpperCase() === selectedCountry
    );

    // Selecting the flag and capital data based on hint 1 and hint 2 respectively
    let content;
    switch (type) {
      case 'flag':
        content = (
          <div>
            <img
              src={country.flags.svg}
              alt={`Flag of ${country.name}`}
              style={{ width: '110px' }}
            />
            <p>Country Flag</p>
          </div>
        );
        break;
      case 'capital':
        content = <p>Capital: {country.capital}</p>;
        break;
      case 'howToPlay':
        content = (
          <div>
            <h2>Rules of the Game</h2>
            <ul>
              <li style={{ textAlign: 'left' }}>
                Guess letters to reveal the country or island name.
              </li>
              <li style={{ textAlign: 'left' }}>
                Use hints to help guess the answer if you're stuck.
              </li>
              <li style={{ textAlign: 'left' }}>
                Each incorrect guess adds a part to the hangman.
              </li>
              <li style={{ textAlign: 'left' }}>
                Game ends after 6 wrong guesses or when you guess the correct
                answer.
              </li>
              <li style={{ textAlign: 'left' }}>
                You may use your local keyboard or the onscreen Keyboard for
                input.
              </li>
            </ul>
          </div>
        );
        break;
      default:
        content = <p>No information available.</p>;
    }

    // Adding the cross icon to close dialog
    setHintContent(
      <div>
        {content}
        <button className="closeButton" onClick={() => setShowHint(false)}>
          x
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <h1 style={{ color: 'white' }}>
        Hangman - Countries and Islands Edition
      </h1>
      {!gameOver && (
        <>
          <div className="contentArea">
            <div className="hintsArea">
              {showHint && <div className="hintDialog">{hintContent}</div>}
              <div className="hintButtons">
                <button onClick={() => helpButtons('flag')}>
                  Hint 1: Show Flag
                </button>
                <button onClick={() => helpButtons('capital')}>
                  Hint 2: Show Capital
                </button>
                <button onClick={() => helpButtons('howToPlay')}>
                  How to Play
                </button>
              </div>
            </div>
            <img src={hangmanStages[mistakes]} alt="Hangman Stage" />
          </div>
          <p style={{ color: 'white' }} className="displayWord">
            {displayWord(selectedCountry, guessedLetters)}
          </p>
          <div className="letterButtons">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || gameOver}
                className="letterButton"
              >
                {letter}
              </button>
            ))}
          </div>
        </>
      )}
      {gameOver && (
        <div
          className={`toast ${
            !displayWord(selectedCountry, guessedLetters).includes('_')
              ? 'success'
              : 'error'
          }`}
        >
          {gameMessage}
          <p>Want to play another round? Click the reset button.</p>
        </div>
      )}
      <button onClick={resetGame} className="resetButton">
        Reset Game
      </button>
    </div>
  );
}

export default App;
