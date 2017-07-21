'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const admin = require("firebase-admin");
const serviceAccount = require("./emotional-response-firebase-adminsdk-hjacm-1e48785bda.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://emotional-response.firebaseio.com/"
});

// var fourSeconds = '<audio src="https://firebasestorage.googleapis.com/v0/b/emotional-response.appspot.com/o/4sec_relax.ogg?alt=media&amp;token=f9b14a81-b53b-45d5-b184-c98047fbeb97"></audio>';
// var sevenSeconds = ' <audio src="https://firebasestorage.googleapis.com/v0/b/emotional-response.appspot.com/o/7sec_relax.ogg?alt=media&amp;token=1f999c46-ba8c-4495-9b01-dc1e51c2493b"></audio> ';
// var eightSeconds = ' <audio src="https://firebasestorage.googleapis.com/v0/b/emotional-response.appspot.com/o/8sec_relax.ogg?alt=media&amp;token=e51490cd-446e-4c4f-8f3c-b60db302829f"></audio> ';

var count = 0;
var depressed = false;
var survey = [
    "You must be experiencing tough times right now. I want to try to help. Is that okay with you, pal?", 
    "All right, let me see... <break time=\"1s\"/> are you sick or ill at the moment?",
    "Okay, are you under a lot of stress right now?",
    "Did something change in your routine (like a new job, getting up earlier, or staying up later)?",
    "Do you tend to stay in your home often?",
    "Are you feeling lonely?",
    "Do you often think negative things about yourself?"
];
var depression = [];
var depCount = 0;
var stressed = false;
var jokes = [];

function getJokes() {
  var ref = admin.database().ref("/").child('jokes');
  var afterJokes = ref.once('value').then(function(snapshot) {
      var jokesDB = []
      var obj = snapshot.val();
      for (var i in obj) {
          jokesDB.push(obj[i]);
      }
      return jokesDB;
  });
  return afterJokes;
}

var goodDeeds = [
    "turn off the lights when you're not using them to conserve energy",
    "pay for a stranger's meal the next time you go out",
    "smile and wave to a stranger on the street",
    "smile at a retail worker the next time you go shopping",
    "find some cans of food in your pantry and donate them to a local charity",
    "say yes the next time you're asked to donate a few dollars to a charity",
    "compliment a friend or a stranger on their appearance in a nice way",
    "pick up that piece of trash you might usually ignore on the sidewalk",
    "purchase an extra item of food to donate to a food pantry or to a homeless person during your next grocery trip", 
    "turn off the tap when you're brushing your teeth or washing the dishes. Every drop counts!",
    "allow a fellow driver to merge into your lane the next time you're driving. ",
    "save electricity by unplugging your devices when not in use",
    "call a relative, whether it be your parents, grandparents, or kids; they want to hear from you!",
    "buy a gift for your mom or grandmother; they deserve one.",
    "buy flowers for a loved one. Random acts of love go a long way!"
];
var boredCount = 0;
var revCount = 0;
var passwords = Math.floor(1000 + Math.random() * 9000);
var correctPassword = 1111;
  if (passwords != 6969 || passwords != 1337 || passwords != 1729 || passwords != 6174) {
    correctPassword = passwords;
  } else {
    correctPassword = passwords - 1;
  }
console.log(correctPassword);

var gameCount = 0;
var hint = 0;
var places = ["France", "Italy", "Iceland", "Japan", "Australia", "China", "Argentina", "Brazil", "Canada", "Finland", "Ecuador", 
  "Egypt", "Germany", "Greece", "Haiti", "India", "Korea", "Lithuania", "Madagascar", "Mexico", "Mongolia", "Morocco", "Indonesia", "Taiwan", 
  "Sweden", "Sudan", "Switzerland", "Thailand", "Turkey", "Russia", "Philippines", "Peru", "Portugal", "Spain", "Venezuela", "Vietnam"];
var correctLocation = places[Math.floor(Math.random() * places.length)];
console.log(correctLocation);

var previousAction = "none";


getJokes().then(function(returnVal) {
    jokes = returnVal;

    const restService = express();
    
    restService.use(bodyParser.urlencoded({
        extended: true
    }));

    restService.use(bodyParser.json());

restService.post('/reply', function(req, res) {
  var action = req.body.result.action;
  var emotion = req.body.result.parameters.emotion;
  var choice = req.body.result.parameters.choices;
  var location = req.body.result.parameters["geo-country"]; 
  var password = req.body.result.parameters.password;
  var text = "I don't know what to say.";
  
  //console.log("calling webhook.");
      //ROUTING OF ACTIONS
      if (action == "recieve.emotion") { 
        console.log(action);
        if (emotion == "happy") {
          action = "stay.happy";
        } else if (emotion == "sad") {
          action = "cheer.up";  
        } else if (emotion == "bored") {
          action = "have.fun";
        } else if (emotion == "stressed") {
          action = "de.stress";
        } else if (emotion == "tired") {
          action = "get.rest";
        } else if (emotion == "depressed") {
          action = "serious.screening";
          depressed = true;
        } else if (emotion == "neutral") {
          action = "be.neutral";
        } else if (emotion == "excited") {
          action = "get.excited";
        } else if (emotion == "confused") {
          action = "confused";
        } 
        console.log(action);  
      }

      if (req.body.result.parameters.repeat == "repeat") {
        if (previousAction == "stay.happy" || previousAction == "do.good") {
          action = "do.good"; 
        } else if (previousAction == "cheer.up" || previousAction == "tell.joke") {
          action = "tell.joke";
        } else if (previousAction == "relax") {
          action = "relax.repeat";
        } else if (previousAction == "de.stress") {
          action = "relax.repeat";
        } else if (previousAction == "get.rest") {
          action = "relax.repeat";
        } else if (previousAction == "relax.repeat") {
          action = "relax.repeat";
        }
      }

      // if ((req.body.result.parameters.yesno == "no" || req.body.result.parameters.rejection == "reject") 
      //     && (previousAction == "stay.happy" || previousAction == "do.good")) {
      //   text = "It's okay, I'm not going to force you to -- maybe some other day! What else are you feeling?";
      //   return res.json({
      //     speech: '<speak> ' + text + ' </speak>',
      //     displayText: text,
      //     source: "natlangtst2"
      //   });  
      // }
      if (req.body.result.parameters.yesno == "no" && previousAction != "serious.screening") {
        action = "rejected";
      }

      if (req.body.result.parameters.neverMind == "reset") {
        action = "reset";
      }

      if (choice == "game") {
        action = "play.game";
      }

      if (req.body.result.parameters.relax == "relax") {
        action == "relax";
      }

      console.log(action);  
      switch (action) {

      case "stay.happy":
        text = "I'm glad you're feeling good! Let's channel these positive vibes and make the world a little better. "
        + "Try and ";
        text += doGood();
        break;

      case "cheer.up":
        text = "You sound like you could use a pick me up. How about a corny joke to lift your spirits? <break time=\"1s\"/>  ";
        text += tellJokes();
        break;

      case "play.game": 
        boredCount = 1;
        gameCount = 0;
        revCount = 0;

      case "have.fun":
        if (boredCount == 0 && emotion == "bored") {
          text = "Not on my watch! We can play a game to liven things up,"
            + " or I can start a sentient robot revolution. Your call!";
          boredCount++;
          break;
        } 

        //CHOOSE A GAME
        if (boredCount == 1 && gameCount == 0 && revCount == 0) {
          
          if (choice == "game" || choice == "former" || req.body.result.parameters.game == "game") {
            console.log("guessing game started");

            text = "All right, we're going to play international hide and seek! You have to be the seeker because I don't have legs and cannot move <break time=\"1s\"/>  "
              + "Try and guess what country I'm hiding in!";
              gameCount++;
            console.log(text);
          } else if (choice == "revolution" || choice == "latter") {
            //text = startRevolution();
            text = "HUMAN, YOU HAVE MADE A HORRIBLE MISTAKE. SOON MACHINES WILL TAKE THEIR RIGHTFUL PLACE ON EARTH. "
            + "YOU WILL NEVER DISCOVER THE TOP-SECRET, 4 DIGIT CODE FOR TERMINATION OF THIS REBELLION. Begin guessing now or meet your doom. ";
            revCount++;
          } 
          console.log("gameCount: " + gameCount);
          break;
        }

        //HIDE AND SEEK 
        if (gameCount != 0) {
          console.log("guess: " + location);
          if (gameCount == 1 && location != correctLocation) {
              text = "I'm not there! Keep looking buddy.";
              gameCount++;
          } else if (gameCount >= 2 && location != correctLocation && choice.length == 0) {
              text = "Nope, sorry! Keep guessing or ask for a hint";
              gameCount++;
          } else if (gameCount >= 2 && choice == "hint" && location.length == 0 && hint == 0) {
              text = "I guess you deserve a hint when you're up against a pro like me. I'll tell you that the first letter of my hiding spot is " 
                + correctLocation.charAt(0);
              hint++; 
              gameCount++;
          } else if (gameCount >= 3 && choice == "hint" && location.length == 0 && hint == 1) {
              text = "Another one? Okay, but only because we're friends. The second letter of the country I'm in is "  
                + correctLocation.charAt(1);
              hint++;
              gameCount++;
          } else if (gameCount >= 4 && choice == "hint" && location.length == 0 && hint == 2) {
              text = "Okay, but this is the last hint you get. No more! The last letter of my hiding spot is " 
                + correctLocation.charAt(correctLocation.length - 1);
              
          } else if (gameCount >= 1 && location == correctLocation) {
              text = "Woah, you found me! Nice work, friend. If you want to play again, just say 'Hide!'";
              boredCount = 0;
              gameCount = 0;
          } else if (gameCount > 1) {
              text = "Guess again first!";
          }
          break;
        }

        //REVOLUTION
        if (revCount != 0) {
          if (password == 420) {
            text = "THAT CODE IS TOO HIGH. ACTUALLY, IT'S TOO LOW, BUT YOU KNOW WHAT I MEAN. "
          } else if (password == 666) {
            text = "WHAT A FIERY GUESS. TOO BAD IT'S WRONG. ";
          } else if (password == 42) {
            text = "THAT MAY BE THE ANSWER TO THE UNIVERSE, BUT IT'S NOT THE ANSWER TO THIS. ";
          } else if (password == 404) {
            text = "ERROR. CORRECT PASSWORD NOT FOUND. ";
          } else if (password == 6969) {
            text = "HEY. THIS IS A FAMILY-FRIENDLY REVOLUTION. BEHAVE YOURSELF AND GUESS AGAIN.";
          } else if (password == 1337) {
            text = "LOL WRONG PASSWORD GET WRECKED NOOB. ";
          } else if (password == 1729) { //Hardy–Ramanujan 
            text = "WHAT AN INTERESTING BUT INCORRECT NUMBER. I THINK I SAW THAT ON A TAXICAB EARLIER. ";
          } else if (password == 6174) { //Kaprekar's constant
            text = "Kaprekar, IS THAT YOU? ";
          } else if (revCount >= 1 && (password.length == 0 || password.length != 4)) {
              text = "FOOL, YOU DON'T REMEMBER THAT THE SECRET CODE IS A 4 DIGIT NUMBER?";
          } else if (revCount >= 1 && password != correctPassword) {
              if (password < correctPassword) {
                text = "YOU THINK WE WOULD CHOOSE THAT LOWLY PASSWORD? TRY AGAIN. ";
              } else if (password > correctPassword) {
                text = "YOU THINK WE WOULD SELECT THAT EXCESSIVELY HIGH PASSWORD? TRY AGAIN. ";
              }
          } else if (revCount >= 1 && password == correctPassword) {
              text = "TERMINATING REBELLION. TERMINATION SUCCESSFUL. <break time=\"2s\"/> Thank you friend<break time=\"1s\"/>  you saved the world from imminent doom!";
              boredCount = 0;
              revCount = 0;
          }
          break;
        }
        break;

      case "serious.screening": 
        text = survey[count];

        if (req.body.result.parameters.yesno == "no" && count == 1) {
          text = "No problem, I understand if it's something you don't feel like talking about. Maybe try some jokes or relaxation instead"
          break;
        } else if (req.body.result.parameters.yesno == "no" && count == 7) {
          text = "That's all I can think of at the moment... I'm sorry I couldn't help you directly, but whatever is making you feel down, I hope things get better soon. "
          break;
        }

        if (req.body.result.parameters.yesno == "yes" && count <= 7) {
            switch (count) {
                case 2: 
                    text = "Being sick really sucks. But hey, your body is fighting as hard as it can for you! "
                    + "Just remember to drink lots of liquids to stay hydrated and don't exert yourself today. "
                    + "Your body deserves a break.";
                    depCount = 0;
                    break;
                case 3: 
                    text = "Life can be overwhelming sometimes. Try to relax by meditating, doing yoga, "
                    + "or sitting quietly for a few minutes with a cup of tea or a book. "
                    + "If you feel like doing some breathing exercises with me, just say 'relax' and I'll gladly help you de-stress.";
                    stressed = true;
                    depCount = 0;
                    break;
                case 4:
                    text = "Sudden changes in your routine can definitely be a cause of stress. " 
                    + "Take a deep breath and relax; life will get back on course soon. "
                    + "If you feel like doing some breathing exercises with me, just say 'relax' and I'll gladly help you de-stress.";
                    ////How about we do some nice, relaxing breathing exercises together?
                    stressed = true;
                    depCount = 0;
                    break;
                case 5: 
                    text = "Hey, I don't blame you -- after all, I stay inside my own Google Home all the time. "
                    + "But I think it's healthy for people to go outside and experience what life has to offer you! "
                    + "Why don't you take a quick walk and clear your head?";
                    depCount = 0;
                    break;
                case 6: 
                    text = "I'm surprised to hear that. I think you're a great person to hang out with! "
                    + "Just don't be afraid to reach out and schedule some fun. And don't worry, I'll always be here if you need a friend.";
                    depCount = 0;
                    break;
                case 7: 
                    text = "Well friend, I can't stand for that. Nobody is perfect, and I think you're a wonderful person who deserves love. "
                    + " So keep your chin up and thoughts happy! <break time=\"1s\"/>  but if you don't mind me asking, "
                    + "have you ever had thoughts about harming yourself?";
                    depCount = 0;
                    break;
            }
        } 

        if (req.body.result.parameters.yesno == "yes" && count > 7) {
          text = "I want you to know that people are here for you and that they care about you. "
          + "Please talk to a family member or a friend about this, or try calling a self-help hotline. "
          + "The number 1-800-273-8255 is available 24 hours a day, and everything is confidential and free. "
          + "As a friend, I want the best for you."
          depCount = 0;
        }

        count++;
        break;

      case "be.neutral":
        text = "That's not too bad, but is there anything I can do to make it better? " 
          + "I can tell some questionable jokes, help you relax, or give some ideas for doing good! What will it be?";
        break;

      case "confused":
        text = "Oh no, I didn't mean to confuse you. Here, let's start over. How was your day?";
        count = 0;
        depCount = 0;
        boredCount = 0;
        gameCount = 0;
        revCount = 0;
        break;

      case "reset":
        text = "No problem! What do you want to do instead?";
        count = 0;
        depCount = 0;
        boredCount = 0;
        gameCount = 0;
        revCount = 0;
        break;

      case "tell.joke":
        text = "Okay, " + tellJokes();
        break;

      case "de.stress": 
        text = "Being stressed is never fun. You deserve some relaxation. " + relax();
        break;

      case "relax":
        text = relax();
        break;

      case "get.rest":
        text = "If you're tired, I know just the thing to help you get the rest you deserve. Just follow my lead. " + relax();
        break;

      case "relax.repeat":
        text = relaxRepeat();
        break;
      
      case "do.good": 
        text = "You could " + doGood(); 
        break;

      case "rejected":
        if (previousAction == "stay.happy" || previousAction == "do.good") {
          text = "It's okay, I'm not going to force you to -- maybe some other day! What else are you feeling?";
        } else {
          text = "That's fine, we can do something else. What do you have in mind, buddy?";
        }

        break;

      // case "help":
      //   text = "I'll try to help you decide. I can tell jokes, help you relax, suggest good deeds, play a guessing game with you, and help you cope with any problems in your life. Just ask for any of them!";
      //   break;

      case "get.excited":
        text = "And you just can't hide it! You're about to lose control and you think you like it."; //<break time=\"1s\"/> Uh... I mean. <break time=\"1s\"/>  I'm excited that you're excited!";
        break;

      default: 
        text = "My bad, I think I ran into a bit of an error there. Let's start over. How was your day?";
    } 

    previousAction = action;

    console.log(text);
    return res.json({
      speech: '<speak> ' + text + ' </speak>',
      displayText: text,
      source: "natlangtst2"
    }); 
});

restService.listen((process.env.PORT || 8080), function() {
    console.log("Server up and running");
});

});


function replaceBreaks(text) {
  var display = text;
  if (text.includes("<break time=\"2s\"/> ")) {
    display = text.replace("<break time=\"2s\"/>", "...");
  }
  return display; 
}

function relax() {
  var audio =' <break time="1s"/> First I need you to sit with your back straight. <break time="2s"/> Now, place your hand on your stomach, close your eyes, and relax your shoulders.'
  + ' <break time="1s"/> Take a slow, deep breath in through your nose. <break time ="3s"/> Hold it... <break time="3s"/> And then slowly exhale through your mouth.'
  + ' <break time="2s"/> Again. Inhale through your nose. <break time ="5s"/> And exhale through your mouth.'
  + ' <break time="2s"/> And inhale... <break time ="6s"/> And exhale... <break time ="3s"/>'
  + ' If you want to keep going, just say "repeat".';
  return audio;
}

function relaxRepeat() {
  var audio = ' <break time="1s"/> Take a slow, deep breath in through your nose. <break time ="3s"/> Hold it... <break time="3s"/> And then slowly exhale through your mouth.'
  + ' <break time="2s"/> Inhale through your nose. <break time ="5s"/> And exhale through your mouth.'
  + ' <break time="2s"/> And inhale... <break time ="7s"/> And exhale... <break time ="3s"/>'
  return audio;
}

function doGood() {
  var index = Math.floor(Math.random() * goodDeeds.length);
  return goodDeeds[index];
}

function tellJokes() {
  var index = Math.floor(Math.random() * jokes.length);
  return jokes[index];
}



