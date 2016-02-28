'use strict';


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if ("AnswerIntent" === intentName) {
        handleStationRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}


function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        cardTitle = "Cafeteria Menu",
        speechOutput = "Which Cafeteria do you want to eat at?",
        repromptText = "Try Again",
        shouldEndSession = false;

    sessionAttributes = {
        "speechOutput": repromptText,
        "repromptText": repromptText,
        };
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function handleStationRequest(intent, session, callback){
  var cardTitle = "Station Menu",
      speechOutput = "Which Cafeteria would you like to eat at";

  var cafeSlot = intent.slots.Cafe;
  var stationSlot = intent.slots.Station;
  //check !answerSlot
  var time = getTime();
  var meal = "unknown";
  if(time >= 6 && time <= 11)
  {
    meal = "breakfast";
  }
  if(time > 11 && time <= 14)
  {
    meal = "lunch";
  }
  if(time >= 17 && time <= 23)
  {
    meal = "late";
  }

  speechOutput = getMenu(meal, cafeSlot.value, stationSlot.value);

     callback(session.attributes,
         buildSpeechletResponse(cardTitle, speechOutput, speechOutput, false));
}

function getTime()
{
  //EST
    var offset = -5.0;

    var clientDate = new Date();
    var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

    var  serverDate = new Date(utc + (3600000*offset));

    return serverDate.getHours();
}

function getMenu(time, cafe ,station)
{
  //Brody
  if(cafe === ("Brody") || cafe === ("Brody Square"))
  {
    //Brimstone Brody
    if(station === ("brimstone"))
    {
      if(time === ("lunch") || time === ("Dinner"))
      {
        return "Burgers, Classic Reuben, Fried Chicken Sandwich, Grilled Chicken Sandwich, Buffalo Chicken Sandwich, Grilled Cheese Sandwich, Hot Dogs, BLT, Seasoned Fries";
      }else {
        return "Brimstone is currently closed";
      }
    }
    //BP Brody
    else if(station === ("boiling point"))
    {
      if(time === ("lunch") || time === ("Dinner"))
      {
        return "Grilled Chicken, Meatballs, Creamy Red sauce, Puttenesca Sauce, Pasta Bar, Italian Breadsticks";
      }else {
        return "boiling point is currently closed";
      }
    }
    //Cayenne Brody
    else if(station === ("cayenne"))
    {
      if(time === ("lunch") || time === ("Dinner"))
      {
        return "Beef (Carne Asada) and Chicken Meat, Made-To-Order: Burritos, Enchiladas, Quesadillas, and Tacos, Black Beans, Cilantro Lime Rice, Homemade Tortilla Chips, Homemade Salsas, Con Queso Dip";
      }else if(time === ("late")){
        return "Tacos or Burritos, Nacho Chips";
      }else{
        return "Cayenne is currently closed";
      }
    }
    //Ciao Brody
    else if(station === ("ciao"))
    {
      if(time === ("lunch"))
      {
        return "Cheese Pizza, Pepperoni Pizza, Meatball Pizza";
      }else if(time === ("dinner")){
        return "Cheese Bread, Pepperoni Pizza, Spinach and Roasted Mushroom Pizza";
      }else if(time === ("late")){
        return "Cheese Bread, Pepperoni Pizza";
      }else{
        return "Ciao is currently closed";
      }
    }
    //Dolce Brody
    else if(station === ("dolce"))
    {
      if(time === ("lunch"))
      {
        return "Assorted Cakes and Pies, Fresh Baked Cookies, Hand Dipped Ice Cream, Soft Serve Ice Cream, Fruit Smoothie";
      }else if(time === ("dinner")){
        return "Assorted Cakes and Pies, Fresh Baked Cookies, Hand Dipped Ice Cream, Soft Serve Ice Cream, Fruit Smoothie";
      }else if(time === ("late")){
        return "Hand Dipped Ice Cream, Soft Serve Ice Cream";
      }else{
        return "Dolce is currently closed";
      }
    }
    //Homestyle Brody
    else if(station === ("homestyle"))
    {
      if(time === ("lunch"))
      {
        return "Rotisserie Chicken, Beef Flank Steak, Mashed Yukon Potatoes, Cashew Vegetable Rice, Sugar Peas, Chicken Gravy, Flank Steak Sauce, Dinner Roll";
      }else if(time === ("dinner")){
        return "Rotisserie Chicken, Pork Wiener Schnitzel, Mashed Yukon Potatoes, Herbed Spaetzle, Vegetable Saute Capri, Chicken Gravy, Dinner Roll, 3 Cheese Sauce";
      }else{
        return "Homestyle is currently closed";
      }
    }
    //Pangea Brody
    else if(station === ("pangea"))
    {
      if(time === ("breakfast"))
      {
        return "Made-To-Order: Omelets, Scrambled Eggs, Hard Boiled Eggs, Ham, Cheese, and Egg Bagel, French Toast Sticks, Sausage Patties, Potato Gems, Vanilla Oatmeal";
      }else if(time === ("lunch"))
      {
        return "Made-To-Order: Omelets, Sausage Quiche, Hard Boiled Eggs, French Toast Sticks, Sausage Patties, Potato Gems, Vanilla Oatmeal";
      }else if(time === ("dinner")){
        return "Stir Fry Bar:Shrimp, Pad Thai Sauce, Orange Ginger Sauce, LoMein Noodles, Basmati Rice, Chicken Andouille Jambalaya, Blackened Chicken, Remoulade, Fried Green Tomatoes, Sweet Potato Biscuits";
      }else{
        return "Pangea is currently closed";
      }
    }
    //S2
    else if(station === ("salad and sushi"))
    {
      if(time === ("lunch") || time === ("Dinner"))
      {
        return "Smoked Salmon Roll, Cream of Mushroom Soup, Vegetable Soup";
      }else if(time === ("late")){
        return "Salad Bar Only";
      }else{
        return "S2 is currently closed";
      }
    }
    //VegOut Brody
    else if(station === ("vegout"))
    {
      if(time === ("lunch"))
      {
        return "Tomato Tortellini Soup, Spinach Artichoke Calzone, Caprese Pasta Bake, Edamame Vegetable Blend, Fresh Fruit Chunks";
      }else if(time === ("dinner"))
      {
        return "Tomato Tortellini Soup, Three Cheese Tomato Basil Lasagna, Roasted Tuscan Vegetables, Garlic Breadsticks, Fresh Fruit Chunks";
      }else{
        return "Vegout is currently closed";
      }
    }
  }
  //Gallery
  else if(cafe === ("gallery") || cafe === ("the gallery"))
  {
    //Bliss Gallery
    if(station === ("bliss"))
    {
      if(time === ("breakfast"))
      {
        return "Continental Breakfast";
      }else if(time === ("lunch"))
      {
        return "Peanut Butter Fudge Cake, Margarita Key Lime Pie, Assorted Cookies";
      }else if(time === ("dinner")){
        return "Chocolate Orange Torte, Oreo Browniesk, Assorted Cookies";
      }else if(time === "late"){
        return "Assorted Cookies";
      }else {
        return "Bliss is currently closed";
      }
    }
    //Brimstone Gallery
    else if(station === ("brimstone"))
    {
      if(time === ("lunch") || time === ("dinner"))
      {
        return "Hamburgers, Cheeseburgers, Grilled Chicken Breasts, Fried Chicken Patties. Buffalo Chicken, Fried Fish, Fries";
      }else if(time === "late"){
        return "Pub Menu";
      }else {
        return "Brimstone is currently closed";
      }
    }
    //Ciao Gallery
    else if(station === ("ciao"))
    {
      if(time === ("lunch"))
      {
        return "Chef's Choice Specialty Pizza, Pepperoni Pizza, Cheese Pizza, Deli Bar";
      }else if(time === ("dinner")){
        return "Chef's Choice Specialty Pizza, Pepperoni Pizza, Cheese Pizza, Cheese Breadsticks, Deli Bar";
      }else if(time === "late"){
        return "Made to Order Personal Pizzas (8 pm - 10 pm), Pepperoni Pizza, Cheese Pizza, Deli Bar";
      }else {
        return "Ciao is currently closed";
      }
    }
    //Lat Gallery
    else if(station === ("latitudes"))
    {
      if(time === ("breakfast"))
      {
        return "Hard Boiled Eggs, Scrambled Eggs, Meatless Breakfast Burrito, Hash Brown Patties, Sausage Links, Vegetarian Sausage, Made to Order Omelets, Made to Order Fried Eggs, Made to Order Waffles";
      }else if(time === ("lunch"))
      {
        return "Saturday Brunch, Hard Boiled Eggs, Scrambled Eggs, Meatless Breakfast Burrito, Hash Brown Patties, Sausage Links, Vegetarian Sausage";
      }else if(time === ("dinner")){
        return "General Tso's Chicken, General Tso's Vegetables, Steamed Rice, Steamed Broccoli";
      }else {
        return "Latitudes is currently closed";
      }
    }
    //NT Gallery
    else if(station === ("new tradition"))
    {
      if(time === ("lunch"))
      {
        return "Beef Stroganoff, Egg Noodles, Peas, Cauliflower & Chickpea Coconut Curry, Brown Rice";
      }else if(time === ("dinner")){
        return "Dry Rub Baked Chicken, Mashed Yukon Potatoes, Spicy Green Beans, BBQ Vegetarian Beef Tips, Breaded Mac & Cheese Wedges, Confetti Rice";
      }else {
        return "New Traditions is currently closed";
      }
    }
    //Berg Gallery
    else if(station === ("berg") || station===("the berg"))
    {
      if(time === ("breakfast"))
      {
        return "Oatmeal";
      }else if(time === ("lunch"))
      {
        return "BBQ Chicken Salad, Soup du Jour, Vegetarian Soup du Jour";
      }else if(time === ("dinner")){
        return "Greek Salad, Soup du Jour, Vegetarian Soup du Jour";
      }else if(time === "late"){
        return "House Salad Bar";
      }else {
        return "Berg is currently closed";
      }
    }
  }
  //Akers
  else if(cafe === ("akers"))  {
    //Bliss Akers
    if(station === ("the pit") || station === ("pit"))
    {
      if(time === ("breakfast"))
      {
        return "Scrambled Eggs, French Toast Sticks, Fried Eggs, Croissants, Grilled Ham, Bacon, Hashbrown Patties, Sliced Cheeses";
      }else if(time === ("lunch"))
      {
        return "BBQ Beef Brisket Sandwich, Cole Slaw, Scrambled Eggs, French Toast Sticks, Fried Eggs, Croissants, Grilled Ham, Bacon, Hashbrown Patties, Sliced Cheeses";
      }else if(time === ("dinner")){
        return "Smoked Beef Brisket, Smoked BBQ Chicken, Cole Slaw, Texas Toast, Ranch Style Beans, Jalapeno Poppers, Vegetarian Patty Melt, Grilled Burgers, Chicken Sandwich";
      }else if(time === "late"){
        return "Vegetarian Patty Melt, Grilled Burgers, Chicken Sandwich";
      }else {
        return "The Pit is currently closed";
      }
    }
    //Slices Akers
    else if(station === ("slices"))
    {
      if(time === ("late") || time === ("lunch") || time === ("dinner"))
      {
        return "Pepperoni Pizza, Cheese Pizza, Meat Lovers Pizza, Chef's Choice Pasta Bake";
      }
      }else {
        return "Slices is currently closed";
      }
    }
    //Sticks and Noodles Akers
    else if(station === ("sticks and noodles"))
    {
      if(time === ("breakfast"))
      {
        return "Made to Order Omelets and Waffles, Hot Cereal, Hard Cooked Eggs";
      }else if(time === ("lunch"))
      {
        return "Made to Order Omelets and Waffles";
      }else if(time === ("dinner")){
        return "Build Your Own Macaroni and Cheese Bar";
      }else {
        return "Sticks and Noodles is currently closed";
      }
    }
    //Sprinkles Akers
    else if(station === ("sprinkles"))
    {
      if(time === ("breakfast"))
      {
        return "MSU Bakers Products";
      }else if(time === ("lunch") || time === ("dinner"))
      {
        return "Fresh Baked Cookies, Assorted Desserts, Soft Serve Ice Cream, Hard Packed Ice Cream";
      }else if(time === "late"){
        return "Fresh Baked Cookies, Assorted Desserts, Soft Serve Ice Cream";
      }else {
        return "Sprinkles is currently closed";
      }
    }
    //Stacks Akers
    else if(station === ("stacks"))
    {
      if(time === ("lunch"))
      {
        return "Creamy Chicken and Rice Soup, Tomato Florentine Soup, Made to Order Sandwiches, Salad Bar";
      }else if(time === ("dinner")){
        return "Soup of the Day, Made to Order Sandwiches, Salad Bar";
      }else if(time === "late"){
        return "Soup of the Day, Made to Order Sandwiches, Salad Bar";
      }else {
        return "Stacks is currently closed";
      }
    }
    //Tandoori Akers
    else if(station === ("tandoori"))
    {
      if(time === ("lunch") || time === ("dinner"))
      {
        return "Garlic Chicken, Vegetable Kabob, Herb Basmati Rice, Woody's Zataar Bread, Spicy Green Beans";
      }else {
        return "Tandoori is currently closed";
      }
    }
  //case
  else if(cafe === ("wilson"))
  {
    //Dessert Wilson
    if(station === ("desserts"))
    {
      if(time === ("dinner")){
        return "Peanut Butter Cake, Margarita Key Lime Pie, Fresh Baked Cookies";
      }else if(time === "late"){
        return "Chocolate Orange Torte, Breaker Cookie, Fresh Baked Cookies";
      }else {
        return "Desserts is currently closed";
      }
    }
    //Italian Wilson
    else if(station === ("bliss"))
    {
      if(time === ("dinner") || time === ("late")){
        return "Spaghetti Noodles, Bow Tie Noodles, Alfredo Sauce, Tomato Sauce, Pesto, Assorted Vegetables ,Diced Chicken, Diced Ham, Mini Meatballs, Cheese Pizza, Pepperoni Pizza, Cheeseburger Baja Pizza, House Breadstick, Garlic Cream Cheese Dip, Mac and Cheese";
      }else {
        return "Itlian Kitchen is currently closed";
      }
    }
    ///Main Wilson
    else if(station === ("main"))
    {
      if(time === ("dinner")){
        return "Vegetarian Enchiladas with Cheese, Pork Roast, Beef Ravioli, Thai Chicken Stir Fry with Peanuts, Stir Fry Vegetable, Baby Carrots, Roasted Red Skin Potatoes, Steamed Rice, Pork Gravy";
      }else if(time === "late"){
        return "Grilled BBQ Chicken Sandwich, Pulled Pork Sandwich, BBQ Gardein Beef Tips, Grilled Chick’n Breast, Mac & Cheese, Baked Beans, French Fries, Onion Rings";
      }else {
        return "Main Serving line  is currently closed";
      }
    }
    //Hub Wilson
    else if(station === ("hub") || station === ("the hub"))
    {
      if(time === ("dinner") || time === "late"){
        return "Sandwiches Made to Order, Rosemary Chicken";
      }else {
        return "Hub is currently closed";
      }
    }
  }
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "Ask me which Cafeteria is serving what at which station",
        repromptText = "To ask, say What is at the Cafeteria's Station, for example what is at brody's brimstone",
        shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

// ------- Helper functions to build responses -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
