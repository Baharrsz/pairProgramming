import React, { Component } from "react";
import axios from "axios";
import Flag from "./components/Flag.js";
import UserInput from "./components/UserInput";
import Score from "./components/Score";
import Header from "./components/Header";

class App extends Component {
  constructor(props) {
    super(props);
    this.wrongGuessScore = -10;
    this.useHintScore = -5;
    this.seeOptionsScore = -20;
  }

  state = {
    countriesArray: undefined,
    country: undefined,
    guessed: [],
    currentScore: 100,
    totalScore: 0,
    announce: null,
    countryInputVal: "",
    languageInputVal: "",
    currencyInputVal: "",
  };
  render() {
    let inputValObj = {
      country: this.state.countryInputVal,
      language: this.state.languageInputVal,
      currency: this.state.currencyInputVal,
    };
    if (!this.state.country) return <div>Loading...</div>;
    else {
      return (
        <>
          <Header />
          <Flag src={this.state.country.flag} announce={this.state.announce} />
          <Score
            current={this.state.currentScore}
            total={this.state.totalScore}
          />
          <UserInput
            handleSubmit={this.handleSubmit}
            handleGiveup={this.handleGiveup}
            handleReset={this.handleReset}
            changeScore={this.changeCurrentScore}
            seeOptionsScore={this.seeOptionsScore}
            country={this.state.country}
            countriesArray={this.state.countriesArray}
            inputVal={inputValObj}
            handleInputChange={this.handleInputChange}
          />
        </>
      );
    }
  }

  componentDidMount() {
    axios
      .get("https://restcountries.eu/rest/v2/all?fields=name")
      .then((response) => {
        //response.data format [{name: country_name}]
        let countriesArray = response.data.map((countryObj) => countryObj.name);
        this.setState({ countriesArray: countriesArray });
        this.getCountry();
      });
  }

  getCountry = () => {
    let country;
    while (!country || this.state.guessed.indexOf(country) >= 0) {
      let index = Math.floor(Math.random() * this.state.countriesArray.length);
      country = this.state.countriesArray[index];
    }
    axios
      .get(`https://restcountries.eu/rest/v2/name/${country}`)
      .then((response) => {
        country = response.data[0];
        console.log(country);
        this.setState({
          country: country,
          announce: null,
        });
      });
  };

  handleSubmit = (submit) => {
    submit.preventDefault();
    let type = submit.target.id;
    const submitted = submit.target[type].value.toLowerCase();

    //Clearing out the input field
    if (type === "country" || type === "language" || type === "currency")
      this.handleInputChange("", type);

    //Adjusting the score and announcement
    switch (type) {
      case "country":
        this.handleFinalGuess(submitted, false);
        break;
      case "continent-options":
        this.handleFeatureGuess("continent", submitted);
        break;

      case "language":
        this.handleFeatureGuess("languages", submitted);
        break;

      case "currency":
        this.handleFeatureGuess("currencies", submitted);
        break;

      case "country-options":
        this.handleFinalGuess(submitted, true);
        break;

      default:
        console.log("Something wrong with submission");
    }

    submit.target.reset();
  };

  handleFinalGuess = (submitted, isMultipleAnswer) => {
    const increment = isMultipleAnswer ? 0 : this.wrongGuessScore;

    if (submitted === this.state.country.name.toLowerCase()) {
      this.setState(
        {
          totalScore: this.state.totalScore + this.state.currentScore,
          currentScore: 100,
          announce: "Yes!",
          guessed: [...this.state.guessed, this.state.country.name],
        },
        () => {
          setTimeout(this.getCountry, 500);
          if (this.state.guess.length === this.state.countriesArray.length)
            this.setState({ guessed: [] });
        }
      );
    } else
      this.setState({
        currentScore: this.state.currentScore + increment,
        announce: "Nope!",
      });
  };

  handleFeatureGuess = (type, submitted) => {
    //Adjust score
    this.changeCurrentScore(this.useHintScore);
    const isCorrect =
      type === "continent"
        ? submitted === this.state.country.region.toLowerCase()
        : this.state.country[type].some(
            (value) => value.name.toLowerCase() === submitted
          );

    //Show announcement
    if (isCorrect) {
      this.setState({
        announce: "Yes",
      });
    } else
      this.setState({
        announce: "No",
      });
  };

  handleGiveup = () => {
    this.setState({
      totalScore: this.state.totalScore + this.useHintScore,
      currentScore: 100,
      countryInputVal: "",
      languageInputVal: "",
      currencyInputVal: "",
    });
    this.getCountry();
  };

  handleReset = () => {
    this.setState({
      currentScore: 100,
      totalScore: 0,
      countryInputVal: "",
      languageInputVal: "",
      currencyInputVal: "",
      guessed: [],
    });
    this.getCountry();
  };

  handleInputChange = (change, type) => {
    let key = `${type}InputVal`;
    let obj = {};
    obj[key] = change;
    this.setState(obj);
  };

  changeCurrentScore = (increment) => {
    this.setState((state) => ({
      currentScore: state.currentScore + increment,
    }));
  };
}

export default App;
