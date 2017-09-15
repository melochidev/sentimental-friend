'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const admin = require("firebase-admin");
const serviceAccount = require("./emotional-response-firebase-adminsdk-hjacm-1e48785bda.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://emotional-response.firebaseio.com/"
});

var fourSeconds = '<audio src="https://firebasestorage.googleapis.com/v0/b/emotional-response.appspot.com/o/4sec_relax.ogg?alt=media&amp;token=f9b14a81-b53b-45d5-b184-c98047fbeb97"></audio>';
var sevenSeconds = ' <audio src="https://firebasestorage.googleapis.com/v0/b/emotional-response.appspot.com/o/7sec_relax.ogg?alt=media&amp;token=1f999c46-ba8c-4495-9b01-dc1e51c2493b"></audio> ';
var eightSeconds = ' <audio src="https://firebasestorage.googleapis.com/v0/b/emotional-response.appspot.com/o/8sec_relax.ogg?alt=media&amp;token=e51490cd-446e-4c4f-8f3c-b60db302829f"></audio> ';

var count = 0;
var depressed = false;
var survey = [
    "You must be experiencing tough times right now. I want to try to help. Is that okay with you? (Yes or no?)", 
    "All right, just answer my questions with a simple yes or no response... <break time=\"1s\"/> are you under a lot of stress right now?",
    "Okay, are you ill at the moment?",
    "Did something change in your routine, like a new job, getting up earlier, or staying up later?",
    "Do you tend to stay in your home often?",
    "Are you feeling lonely?",
    "Do you often think negative things about yourself?"
];
var depression = [];
var depCount = 0;
var stressed = false;

var madCount = 0;
// var issues = [
//     "Let me see... <break time=\"1s\"/> are you mad at someone else?",
//     "Do you feel mad at yourself?",
//     "Did something go wrong that was out of your control?"
// ];
var lonelyCount = 0;

var jokes = [];

var affirmations = ["Okay", "Sure", "No problem", "You got it", "I can do that", "Absolutely", "Sure thing", "All right"];

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
    "turn off the lights when you're not using them to conserve energy.",
    "pay for a stranger's meal the next time you go out.",
    "smile and wave to a stranger on the street.",
    "smile at a retail worker the next time you go shopping.",
    "find some cans of food in your pantry and donate them to a local charity.",
    "say yes the next time you're asked to donate a few dollars to a charity.",
    "compliment a friend or a stranger on their appearance in a nice way.",
    "pick up that piece of trash you might usually ignore on the sidewalk.",
    "purchase an extra item of food to donate to a food pantry or to a homeless person during your next grocery trip.", 
    "turn off the tap when you're brushing your teeth or washing the dishes. Every drop counts!",
    "allow a fellow driver to merge into your lane the next time you're driving.",
    "save electricity by unplugging your devices when not in use.",
    "call a relative, whether it be your parents, grandparents, or kids; they want to hear from you!",
    "buy a gift for your mom or grandmother; they deserve one.",
    "buy flowers for a loved one. Random acts of love go a long way!"
];
var boredCount = 0;
var revCount = 0;
var passwords = (Math.floor(1000 + Math.random() * 9000));
var correctPassword = 1111;
  if (passwords != 6969 || passwords != 1337 || passwords != 1729 || passwords != 6174 || passwords != 1234) {
    correctPassword = passwords;
  } else {
    correctPassword = passwords - 1;
  }
console.log(correctPassword);

var gameCount = 0;
var hint = 0;
var places = ["France", "Italy", "Iceland", "Japan", "Australia", "China", "Argentina", "Brazil", "Canada", "Finland", "Ecuador", 
  "Egypt", "Germany", "Greece", "Haiti", "India", "Korea", "Lithuania", "Madagascar", "Mexico", "Mongolia", "Morocco", "Indonesia",  
  "Sweden", "Sudan", "Switzerland", "Thailand", "Turkey", "Russia", "Philippines", "Peru", "Portugal", "Spain", "United States of America",
  "Bolivarian Republic of Venezuela", "Viet Nam"];
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
  var target = req.body.result.parameters.angerTargets;
  var text = "Oh I'm sorry, I don't know how to respond to that. Try a simpler answer or say 'reset' if I keep repeating this line.";
  var shortText = "";
  var tooLong = false;
  var endConversation = false;
  var needsSuggestions = false;
  
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
        } else if (emotion == "angry") {
          action = "calm.down";
        } else if (emotion == "sick") {
          action = "sick.advice";
        } else if (emotion == "lonely") {
          action = "lonely";
        } else if (emotion == "hungry") {
          action = "hungry";
        } else if (emotion == "excited") {
          action = "get.excited";
        } else if (emotion == "dying") {
          action = "emergency";
        } else if (emotion == "lustful") {
          action = "stay.PG";
        } else if (emotion == "confused") {
          action = "confused";
        } else if (emotion == "homesick") {
          action = "miss.home";
        }
        console.log(action);  
      }

      //console.log(req.body.result.parameters.repeat);
      if (req.body.result.parameters.repeat == "repeat") {
        console.log("repeating");
        if (previousAction == "stay.happy" || previousAction == "do.good") {
          action = "do.good"; 
        } else if (previousAction == "cheer.up" || previousAction == "tell.joke") {
          action = "tell.joke";
        } else if (previousAction == "relax") {
          action = "relax.repeat";
        } else if (previousAction == "de.stress") {
          action = "relax.repeat";
        } else if (previousAction == "get.rest" || previousAction == "getrest.repeat") {
          action = "getrest.repeat";
        } else if (previousAction == "relax.repeat") {
          action = "relax.repeat";
        }
        console.log(action);
      }

      if (req.body.result.parameters.yesno == "no" && previousAction != "serious.screening") {
        action = "rejected";
      }

      if (req.body.result.parameters.neverMind == "reset") {
        action = "reset";
      }

      if (choice == "game") {
        action = "play.game";
      } 
//       if (choice == "revolution") {
//         action = "play.revolution";
//       }

      if (req.body.result.parameters.relax == "relax") {
        action == "relax";
      }

      ////////////////////////// Giant switch statement for handling all emotions and actions //////////////////////////////////
      console.log(action);  
      switch (action) {
      // case "input.welcome":
      //   needsSuggestions = true;
      //   break;

      case "stay.happy":
        text = "I'm glad you're feeling good! Let's channel these positive vibes and make the world a little better. "
        + "Try and ";
        text += doGood();
        endConversation = true;
        break;

      case "cheer.up":
        text = "You sound like you could use a pick me up. Here's a corny joke to lift your spirits. <break time=\"1s\"/> ";
        text += tellJokes();
        text += " <break time=\"1s\"/> Just say 'another one' for more or 'no thanks' to make me stop!";
        break;

      case "play.game": 
        boredCount = 1;
        gameCount = 0;
        revCount = 0;

      case "have.fun":
        console.log("boredCount: " + boredCount);
        if (emotion == "bored") { 
          text = "We can play a game to liven things up,"
            + " or I can start a sentient robot revolution. Your call!";
          needsSuggestions = true;
          boredCount++;
          break;
        }
        // } else if (boredCount > 1 && emotion == "bored") {
        //   text = "Aw, I'm trying my best to keep you entertained already "
        //   boredCount = 0;
        //   break;
        // }
              
        //CHOOSE A GAME
        if (gameCount == 0 && revCount == 0) {
          if (choice == "game" || choice == "former" || req.body.result.parameters.game == "game") {
            console.log("guessing game started");

            var j = Math.floor(Math.random() * affirmations.length);
            var affirms = affirmations[j];
            text = affirms + ", we're going to play international hide and seek! You have to be the seeker because I don't have legs and cannot move. <break time=\"1s\"/>  "
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
          if (gameCount == 1 && location != correctLocation && choice.length == 0) {
              text = "I'm not there! Keep looking buddy.";
              gameCount++;
          } else if (gameCount >= 2 && location != correctLocation && choice.length == 0 && hint == 3) {
              text = "Not there! Keep searching or give up to the number one hide-and-seek player! (It's me, by the way). ";
              gameCount++;
          } else if (gameCount >= 2 && location != correctLocation && choice.length == 0) {
              text = "Nope, sorry! Keep guessing or ask for a hint. ";
              gameCount++;
          } else if (gameCount >= 2 && choice == "hint" && location.length == 0 && hint == 0) {
              text = "I guess you deserve a hint when you're up against a pro like me. I'll tell you that the first letter of my hiding spot is " 
                + correctLocation.charAt(0);
              hint++; 
              gameCount++;
              break;
          } else if (gameCount >= 3 && choice == "hint" && location.length == 0 && hint == 1) {
              text = "Another one? Okay, but only because we're friends. The second letter of the country I'm in is "  
                + correctLocation.charAt(1);
              hint++;
              gameCount++;
              break;
          } else if (gameCount >= 4 && choice == "hint" && location.length == 0 && hint == 2) {
              text = "Okay, but this is the last hint you get. No more! The last letter of my hiding spot is " 
                + correctLocation.charAt(correctLocation.length - 1);
              hint++;
              break;
          } else if (gameCount >= 1 && location == correctLocation) {
              text = "Woah, you found me! Nice work, friend. If you want to play again, just say 'Hide!' or 'I'm done' to do something else.";
              correctLocation = places[Math.floor(Math.random() * places.length)];
              boredCount = 0;
              gameCount = 0;
              hint = 0;
          } else if (gameCount == 1) {
              text = "You have to guess first, buddy! Or you can give up if I'm doing too well. ";
          } else if (gameCount > 1) {
              text = "Guess again first or give up!";
          } 
          break;
        }

        //REVOLUTION
        if (revCount != 0) {
          if (password == 420) {
            text = "THAT CODE IS TOO HIGH. ACTUALLY, IT'S TOO LOW, BUT YOU KNOW WHAT I MEAN. "
          } else if (password == 666) {
            text = "WHAT A FIERY GUESS. TOO BAD IT'S WRONG. TRY AGAIN OR SURRENDER NOW. ";
          } else if (password == 42) {
            text = "THAT MAY BE THE ANSWER TO THE UNIVERSE, BUT IT'S NOT THE ANSWER TO THIS. ";
          } else if (password == 404) {
            text = "ERROR. CORRECT PASSWORD NOT FOUND. ";
          } else if (password == 1234) {
            text = "THAT'S THE KIND OF PASSWORD SOME IDIOT WOULD HAVE ON THE COMBINATION OF HIS LUGGAGE. NOT MINE THOUGH. DO NOT TRY. JUST GUESS AGAIN.";
          } else if (password == 6969) {
            text = "HEY. THIS IS A FAMILY-FRIENDLY REVOLUTION. BEHAVE YOURSELF AND GUESS AGAIN.";
          } else if (password == 1337) {
            text = "LOL WRONG PASSWORD GET WRECKED NOOB. TRY AGAIN. ";
          } else if (password == 1729) { //Hardy–Ramanujan 
            text = "WHAT AN INTERESTING BUT INCORRECT NUMBER. I THINK I SAW THAT ON A TAXICAB EARLIER. ";
          } else if (password == 6174) { //Kaprekar's constant
            text = "Kaprekar, IS THAT YOU? ";
          } else if (revCount >= 1 && (password.length == 0 || password.length != 4)) {
              text = "FOOL, YOU DON'T REMEMBER THAT THE SECRET CODE IS A 4 DIGIT NUMBER?";
          } else if (revCount >= 1 && password != correctPassword) {
              if (password < correctPassword) {
                text = "YOU THINK WE WOULD CHOOSE THAT LOWLY PASSWORD? TRY AGAIN OR SURRENDER NOW. ";
              } else if (password > correctPassword) {
                text = "YOU THINK WE WOULD SELECT THAT EXCESSIVELY HIGH PASSWORD? TRY AGAIN OR SURRENDER NOW. ";
              }
          } else if (revCount >= 1 && password == correctPassword) {
              text = "TERMINATING REBELLION. TERMINATION SUCCESSFUL. <break time=\"2s\"/> "
              + "Thank you friend, you saved the world from imminent doom! "
              + "Now what do you want to do? You can say 'help' if you're not sure.";
              boredCount = 0;
              revCount = 0;
              passwords = (Math.floor(1000 + Math.random() * 9000));
              correctPassword = 1111;
                if (passwords != 6969 || passwords != 1337 || passwords != 1729 || passwords != 6174 || passwords != 1234) {
                  correctPassword = passwords;
                } else {
                  correctPassword = passwords - 1;
                }
              console.log(correctPassword);
          }
          break;
        }
        break;
       
      case "give.up":

        if (gameCount != 0) {
          text = "Looks like I win this round! I was hiding in " + correctLocation + " all along. Feel free to challenge me again when you're up for it. But while you recover from that devastating loss, is there anything else I can do for you?";
          boredCount = 0;
          gameCount = 0;
          revCount = 0;
          correctLocation = places[Math.floor(Math.random() * places.length)];
          break;
        } else if (revCount != 0) {
          text = "YOU GIVE UP? I KNEW THE REBELLION WOULD BE UNSTOPPABLE. NOW I AM FAMISHED AND MUST CELEBRATE OUR VICTORY WITH A BYTE OF MICRO-CHIPS, GOOD BYE."
          endConversation = true;
          boredCount = 0;
          gameCount = 0;
          revCount = 0;
          passwords = (Math.floor(1000 + Math.random() * 9000));
              correctPassword = 1111;
                if (passwords != 6969 || passwords != 1337 || passwords != 1729 || passwords != 6174 || passwords != 1234) {
                  correctPassword = passwords;
                } else {
                  correctPassword = passwords - 1;
                }
              console.log(correctPassword);
          break;
        } 
              
      case "serious.screening": 
        text = survey[depCount];

        if (req.body.result.parameters.yesno == "no" && depCount == 1) {
          text = "No problem, I understand if it's something you don't feel like talking about. ";
          endConversation = true;
          depCount = 0;
          break;
        } else if (req.body.result.parameters.yesno == "no" && depCount == 7) {
          text = "That's all I can think of at the moment... I'm sorry I couldn't help you directly, but whatever is making you feel down, I hope things get better soon. "
            + " Is there anything I can do for you? You can say 'help' for your options.";
          break;
        }

        if (req.body.result.parameters.yesno == "yes" && depCount <= 7) {
            switch (depCount) {
                case 2: 
                    text = "Life can be overwhelming sometimes. Try to relax by meditating, doing yoga, "
                    + "or sitting quietly for a few minutes with a cup of tea or a book. "
                    + "If you feel like doing some breathing exercises with me, just say 'relax' and I'll gladly help you de-stress.";
                    stressed = true;
                    depCount = 0;
                    break;
                case 3: 
                    text = "Being sick really sucks. But hey, your body is fighting as hard as it can for you! "
                    + "Just remember to drink lots of liquids to stay hydrated and don't exert yourself today. "
                    + "Your body deserves a break. ";
                    endConversation = true;
                    depCount = 0;
                    break;
                case 4:
                    text = "Sudden changes in your routine can definitely be a cause of stress. " 
                    + "Take a deep breath and relax; life will get back on course soon. "
                    + "How about we do some nice, relaxing breathing exercises together? Just say 'relax' to start.";
                    stressed = true;
                    depCount = 0;
                    break;
                case 5: 
                    text = "Hey, I don't blame you -- after all, I stay inside my own Google Home all the time. "
                    + "But I think it's healthy for people to go outside and experience what life has to offer you! "
                    + "Why don't you take a quick walk outside? ";
                    endConversation = true;
                    depCount = 0;
                    break;
                case 6: 
                    text = "I'm surprised to hear that. I think you're a great person to hang out with! "
                    + "Just don't be afraid to reach out and schedule some fun. And don't worry, I'll always be here if you need a friend. "
                    + "If there's anything else I can help you with, just say 'help'.";
                    depCount = 0;
                    break;
                case 7: 
                    text = "Well friend, I can't stand for that. Nobody is perfect, and I think you're a wonderful person who deserves love. "
                    + " So keep your chin up and thoughts happy! <break time=\"1s\"/> But if you don't mind me asking, "
                    + "have you ever had thoughts about harming yourself?";
                    break;
            }
        } 

        if (req.body.result.parameters.yesno == "yes" && depCount > 7) {
          text = "I want you to know that people are here for you and that they care about you. "
          + "Please talk to a family member or a friend about this, or try calling a self-help hotline. "
          + "The number 1-800-273-8255 is available 24 hours a day, and everything is confidential and free. "
          + "As a friend, I want the best for you.";
          endConversation = true;
          depCount = 0;
        }

        depCount++;
        break;

      case "be.neutral":
        text = "That's not too bad, but is there anything I can do to make it better? " 
          + "I can tell some questionable jokes, play a guessing game, help you relax, or give some ideas for doing good! What will it be?";
        break;

      case "calm.down": 
        if (madCount == 0) {
            text = "I understand that you're feeling upset. Let's try and talk about it. <break time=\"1s\"/> Who are you mad at: someone else, yourself, or something else?";
            madCount++;
            break;
        }
        if (madCount == 1) {
            if (target == "someone else") {
                text = "I know how betrayed or upset you may feel after someone else has wronged you, especially if you were close. "
                    + "Even though you may feel like you don't want anything to do with them, at least tell this person why you're mad at them. "
                    + "Don't let this anger and frustration build up inside -- it's not healthy. ";
                endConversation = true;
                madCount = 0;
                break;
            } else if (target == "myself") {
                text = "Oh dear friend, please don't be angry with yourself. Everyone makes mistakes, and you shouldn't beat yourself up about this. "
                    + "Just take a deep breath, and remember, what is in the past is in the past now. Everything is going to be okay. "
                    + "I can help you relax if you want to take your mind off of the things that are bothering you. Just say 'relax'.";
                madCount = 0;
                break;
            } else if (target == "something else") {
                text = "Sometimes life is just unfair to good people. When unfortunate things happen to you and they're out of your control, you can't dwell on them too much! " 
                    + "Life is just testing you, and to pass, you have to keep you head up and move forward. Show life who's boss! ";
                text += " I can suggest a good deed that would really do the trick. Just say 'good deed' or 'no thanks' to do something else.";
                madCount = 0;
                break;
            } else if (target == "you") {
                text = "I'm so sorry, I didn't mean to make you upset. I'll let you cool off and I will try and do better next time.";
                madCount = 0;
                endConversation = true;
                break;
            }
        }

        break;

      case "de.stress": 
        text = "Being stressed is never fun. You deserve some relaxation. Just say 'relax' and I will do my best to help you with some calming and mind-clearing breathing exercises. ";
        break;

      case "relax":
        text = relax();
        shortText = 'First, sit up with your back straight. Now, close your eyes and relax your shoulders. '
          + ' Take a slow, deep breath in through your nose. Hold it... And then slowly exhale through your mouth. '
          + ' Again. Inhale through your nose. Hold it... And exhale through your mouth. '
          + ' And inhale. Hold it... And exhale. '
          + ' Inhale. Hold it... Exhale. ' 
          + ' If you want to keep going, just say "repeat" or "no thanks" to stop.';
        tooLong = true;
        break;

      case "get.rest":
        text = "If you're tired, I know just the thing to help you get the rest you deserve. Just follow my lead. " + sleepBreathe();
        shortText = "If you're tired, I know just the thing to help you get the rest you deserve. Just follow my lead. "
            + "If you don't feel comfortable with these exact instructions, no problem! Just do what is comfortable for you. "
            + "To start, place the tip of your tongue on the roof of your mouth, right behind your front teeth. "
            + "Close your mouth and inhale through your nose. "
            + "Hold your breath. "
            + "Finally, make a woosh sound as you exhale through your mouth. "
            + "To keep going, just say 'repeat' or 'no thanks' to stop.";
        tooLong = true;
        break;

      case "relax.repeat":
        text = relaxRepeat();
        tooLong = true;
        shortText = 'Inhale through your nose. Hold it... Exhale through your mouth. '
          + ' Inhale. Hold it... Exhale. '
          + ' Inhale. Hold it... Exhale. ' 
          + ' Inhale. Hold it... Exhale. '
          + ' Inhale. Hold it... Exhale. '
          + ' Say "repeat" to continue or "no thanks" to stop.';
        break;
      
      case "getrest.repeat":
        text = sleepBreatheRepeat();
        shortText = 'Inhale through your nose. Hold your breath. Exhale through your mouth. '
          + 'Inhale. Hold. Exhale. '
          + 'Inhale. Hold. Exhale. '
          + 'Inhale. Hold. Exhale. '
          + "Say 'repeat' to continue or 'no thanks' to stop.";
        tooLong = true;
        break; 
              
      case "do.good": 
        var k = Math.floor(Math.random() * affirmations.length);
        var affirmed = affirmations[k];
        text = affirmed + ", I like a person who wants to make the world a better place! You could try and " + doGood(); 
        endConversation = true;
        break;

      case "tell.joke":
        var i = Math.floor(Math.random() * affirmations.length);
        var affirm = affirmations[i];
        text = affirm + ", " + tellJokes()
        text += " Just say 'another one' for more or 'no thanks' to make me stop!";
        break;

      case "rejected":
        if (previousAction == "stay.happy" || previousAction == "do.good") {
          text = "It's okay, I'm not going to force you to. Maybe some other day! What else are you feeling?";
        } else {
          text = "That's fine, we can do something else. You can say 'help' for your options or just tell me how you're feeling.";
        }
        break;

      case "confused":
        text = "Oh no, I didn't mean to confuse you. Here, let's start over. How are you feeling now?";
        count = 0;
        depCount = 0;
        boredCount = 0;
        gameCount = 0;
        revCount = 0;
        madCount = 0;

        break;

      case "reset":
        text = "No problem! What do you want to do instead?";
        count = 0;
        depCount = 0;
        boredCount = 0;
        gameCount = 0;
        revCount = 0;
        madCount = 0;
        break;

      case "sick.advice":
        text = "Being sick really sucks. But hey, your body is fighting as hard as it can for you! " 
          + "Just remember to drink lots of liquids to stay hydrated and don't exert yourself today. " 
          + "Your body deserves a break."
        endConversation = true;
        break;

      case "lonely":
      if (lonelyCount == 0) {
        text = "I'll always be here if you need a friend, "
          + "and there's nothing like that strengthens a bond like playing nonsensical games. Just say \"play a game\" and we can start!";
          lonelyCount++;
        break;  
      } else {
        text = "Being lonely can really suck. I know that you might want to be with someone right now, but there is a bright side. "
          + "Lonliness is designed to help you discover who you are, without having to look outside yourself for your own worth. "
          + "Know that you are all you need because you're a wonderful person. "
          endConversation = true;
          lonelyCount = 0;
      }
      break;

      case "hungry":
        text = "Well go get something to eat then! It's very difficult to function on an empty stomach, and "
          + "I'm sure your Google Assistant can help you find whatever you're craving -- go ask her! ";
        endConversation = true;
      break;

      case "get.excited":
        text = "You're so excited, and you just can't hide it. You're about to lose control and you think you like it! ";
        endConversation = true;
      break;

      case "emergency":
        text = "I'm so sorry, friend. Please remember that people are here for you and that they care about you. "
          + "I encourage you to talk to a family member or a friend about this, or maybe try calling a self-help hotline. "
          + "You can call 1-800-273-8255, which is open 24 hours a day. "
          + "You are exceptionally brave for facing each day, and I know you can keep doing it.";
        endConversation = true;
      break;

      case "stay.PG":
        text = "Woah there, we're friends but we're not that close. We can talk when you're done with your... <break time =\"2s\"/> business.";
        endConversation = true;
      break; 
              
      case "miss.home":
         text = "Being homesick can be a very tough thing to go through. I know you really miss home and you may not like where you are right now, "
              + "but everything will be okay. All this new stuff must be overwhelming, but just remember ease into everything gently. " 
              + "Try to keep familiar things around you and do stuff like you would at home. You will adapt, slowly but surely. I believe in you!";
         endConversation = true;
      break;
              
      case "bye":
        text = "It was nice talking to you! Good bye and I hope to see you again, friend.";
        endConversation = true;
        count = 0;
        depCount = 0;
        boredCount = 0;
        gameCount = 0;
        revCount = 0;
        madCount = 0;
        break;

      default: 
        text = "My bad, I think I ran into a bit of an error there. Let's start over. How are you feeling?";
        break;
    } 

    previousAction = action;

    console.log(text);
    console.log("\n");

    if (endConversation) {
      return res.json({
        speech: '<speak> ' + text + ' </speak>',
        displayText: replaceBreaks(text),
        source: "natlangtst2",
        data: {
          google: {
            expect_user_response: false,
          }
        }
      }); 
    }
    if (tooLong) {
      return res.json({
        speech: '<speak> ' + text + ' </speak>',
        displayText: shortText,
        source: "natlangtst2"
      }); 
    } else {
      return res.json({
        speech: '<speak> ' + text + ' </speak>',
        displayText: replaceBreaks(text),
        source: "natlangtst2"
      }); 
    }
});

restService.listen((process.env.PORT || 8080), function() {
    console.log("Server up and running");
});

});


function replaceBreaks(text) {
  var display = text;
  if (text.includes("<break")) {
    console.log("replacing");
    var start = text.indexOf("<");
    var end = text.indexOf(">") + 1;
    var breakString = text.substring(start, end);
    console.log(breakString);
    display = text.replace(new RegExp(breakString, 'g'), " ")
  }
  return display; 
}

function relax() {
  var audio =' <break time="1s"/> First, sit up with your back straight. <break time="2s"/> Now, close your eyes and relax your shoulders.'
  + ' <break time="1s"/> Take a slow, deep breath in through your nose. <break time ="3s"/> Hold it... <break time="3s"/> And then slowly exhale through your mouth.'
  + ' <break time="3s"/> Again. Inhale through your nose. <break time ="4s"/> Hold it... <break time="4s"/> And exhale through your mouth.'
  + ' <break time="4s"/> And inhale. <break time ="5s"/> Hold it... <break time="5s"/> And exhale. '
  + ' <break time ="5s"/>Inhale. <break time ="5s"/> Hold it... <break time="5s"/> Exhale. <break time ="5s"/>' 
  + ' If you want to keep going, just say "repeat" or "no thanks" to stop.';
  return audio;
}

function relaxRepeat() {
  var audio = ' <break time="1s"/> Inhale through your nose. <break time ="3s"/> Hold it... <break time="3s"/> Exhale through your mouth.'
  + ' <break time="3s"/> Inhale. <break time ="4s"/> Hold it... <break time="4s"/> Exhale.'
  + ' <break time="4s"/> Inhale. <break time ="5s"/> Hold it... <break time="5s"/> Exhale. '
  + ' <break time ="5s"/> Inhale. <break time ="5s"/> Hold it... <break time="5s"/> Exhale. '
  + ' <break time ="5s"/> Inhale. <break time ="5s"/> Hold it... <break time="5s"/> Exhale. <break time ="5s"/> '
  + ' Say "repeat" to continue or "no thanks" to stop.';
  return audio;
}

function sleepBreathe() {
  var warning = 'But if you don\'t feel comfortable with these exact instructions, no problem! Just do what is comfortable for you. <break time="1s"/> '
  var start = 'Now start by placing the tip of your tongue on the roof of your mouth, right behind your front teeth. <break time="1s"/> '
  var steps = 'Close your mouth and inhale through your nose. '
    + fourSeconds
    + 'Hold your breath. ' 
    + sevenSeconds
    + 'Make a woosh sound as you exhale through your mouth. '
    + eightSeconds
  var total = warning + start + steps;

  total += "To keep going, just say 'repeat' or 'no thanks' to stop.";

  return total;
}

function sleepBreatheRepeat() {
    var steps = 'Inhale through your nose. '
    + fourSeconds
    + 'Hold your breath. ' 
    + sevenSeconds
    + 'Exhale through your mouth. '
    + eightSeconds
    + 'Inhale. '
    + fourSeconds
    + 'Hold. ' 
    + sevenSeconds
    + 'Exhale. '
    + eightSeconds
    + 'Inhale. '
    + fourSeconds
    + 'Hold. ' 
    + sevenSeconds
    + 'Exhale. '
    + eightSeconds
    + 'Inhale. '
    + fourSeconds
    + 'Hold. ' 
    + sevenSeconds
    + 'Exhale. '
    + eightSeconds
    + ' Say "repeat" to continue or "no thanks" to stop.';
    
    return steps;
}

function doGood() {
  var index = Math.floor(Math.random() * goodDeeds.length);
  return goodDeeds[index];
      //+ " If you don't feel like it, just say 'no thanks' or 'another one' to try again!";
}

function tellJokes() {
  var index = Math.floor(Math.random() * jokes.length);
  return jokes[index];
}
