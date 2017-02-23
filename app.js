

var restify = require('restify');
var builder = require('core');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session, args, next) {
        
        if (!session.userData.name) {
            session.beginDialog('/profile');
            
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
        //session.send('How can I help you ??');
         session.beginDialog('/menu');
    },
     
    function (session, results) {
        // Always say goodbye
        session.beginDialog("/carousel1");
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    },
]);
bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);


bot.dialog('/menu', [
    function (session) {
        builder.Prompts.choice(session, "Have you already booked a flight or would you like to check the best offers", "Already Booked|Checkout Offers");//, "cards|list|carousel|receipt|actions|(quit)"
    },
    function (session, results) {
        if (results.response && results.response.entity != 'Checkout Offers') {
            // Launch demo dialog
            session.beginDialog('/carousel1');
        } else {
            // Exit the menu
            session.beginDialog('/carousel2');
            session.beginDialog('/carousel1');
        }
    },
    //function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        //ession.replaceDialog('/menu');
    //}
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Main Page.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);



/*bot.dialog('/cards', [
    function (session) {
        session.send("You can use Hero & Thumbnail cards to send the user visually rich information...");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
            ]);
        session.send(msg);

        msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.VideoCard(session)
                    .title("Video Card")
                    .subtitle("Microsoft Band")
                    .text("This is Microsoft Band. For people who want to live healthier and achieve more there is Microsoft Band. Reach your health and fitness goals by tracking your heart rate, exercise, calorie burn, and sleep quality, and be productive with email, text, and calendar alerts on your wrist.")
                    .image(builder.CardImage.create(session, "https://tse1.mm.bing.net/th?id=OVP.Vffb32d4de3ecaecb56e16cadca8398bb&w=150&h=84&c=7&rs=1&pid=2.1"))
                    .media([
                        builder.CardMedia.create(session, "http://video.ch9.ms/ch9/08e5/6a4338c7-8492-4688-998b-43e164d908e5/thenewmicrosoftband2_mid.mp4")
                    ])
                    .autoloop(true)
                    .autostart(false)
                    .shareable(true)                    
            ]);
        session.send(msg);  

        msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.ThumbnailCard(session)
                    .title("Thumbnail Card")
                    .subtitle("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market"))
            ]);
        session.endDialog(msg);
    }
]);*/


bot.dialog('/carousel1', [
        function (session) {
        builder.Prompts.choice(session, "Thank you for giving us a chance to serve you, would you like to pre order your meal", "Yes|No");//, "cards|list|carousel|receipt|actions|(quit)"
    },
    function (session, results) {
        if (results.response && results.response.entity != 'No') {
        session.send("Please wait while we fetch the trip details....");
        session.beginDialog('/Meal');
        } else {
            // Exit the menu
            
            session.endDialog();
        }
    },
    //function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        //ession.replaceDialog('/menu');
    //}
]);
bot.dialog('/Meal', [
        function (session) {
            //session.send("check 2...");
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("ORD -> MEL")
                    .text("Meals Option Available")
                    /*.images([
                        builder.CardImage.create(session, "https://www.google.co.in/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwjOpNSAzaTSAhWBnpQKHXDvDVEQjBwIBA&url=http%3A%2F%2Flogok.org%2Fwp-content%2Fuploads%2F2014%2F02%2FUnited_Airlines_earth-logo.png&psig=AFQjCNGuI-aUb-GCKBwufTCZYNGjXmAPqw&ust=1487883733152186")
                            .tap(builder.CardAction.showImage(session, "https://www.google.co.in/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwjOpNSAzaTSAhWBnpQKHXDvDVEQjBwIBA&url=http%3A%2F%2Flogok.org%2Fwp-content%2Fuploads%2F2014%2F02%2FUnited_Airlines_earth-logo.png&psig=AFQjCNGuI-aUb-GCKBwufTCZYNGjXmAPqw&ust=1487883733152186")),
                    ])*/
                    .buttons([
                        //builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Indian_cuisine", "About the cuisine"),
                        builder.CardAction.imBack(session, "ORD:MEL", "Book Now")
                    ]),
                new builder.HeroCard(session)
                    .title("ORD -> LIM")
                    .text("Meals Booked")
                   /* .images([
                        builder.CardImage.create(session, "http://tandsgo.com/wp-content/uploads/2012/05/sad-robot.png")
                            .tap(builder.CardAction.showImage(session, "http://tandsgo.com/wp-content/uploads/2012/05/sad-robot.png")),
                    ])*/
                    .buttons([
                        //builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Indian_cuisine", "About the cuisine"),
                       // builder.CardAction.imBack(session, "select:100", "Book Now")
                    ]),
                    new builder.HeroCard(session)
                    .title("ORD -> YZH")
                    .text("No meal pre order available on this trip !!!")
                    /*.images([
                        builder.CardImage.create(session, "http://tandsgo.com/wp-content/uploads/2012/05/sad-robot.png")
                            .tap(builder.CardAction.showImage(session, "http://tandsgo.com/wp-content/uploads/2012/05/sad-robot.png")),
                    ])*/
                    .buttons([
                        //builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Indian_cuisine", "About the cuisine"),
                        //builder.CardAction.imBack(session, "select:100", "Book Now")
                    ]),
                    new builder.HeroCard(session)
                    .title("EWR -> KUL")
                    .text("Meals Option Available")
                    /*.images([
                        builder.CardImage.create(session, "https://www.google.co.in/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwjOpNSAzaTSAhWBnpQKHXDvDVEQjBwIBA&url=http%3A%2F%2Flogok.org%2Fwp-content%2Fuploads%2F2014%2F02%2FUnited_Airlines_earth-logo.png&psig=AFQjCNGuI-aUb-GCKBwufTCZYNGjXmAPqw&ust=1487883733152186")
                            .tap(builder.CardAction.showImage(session, "https://www.google.co.in/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwjOpNSAzaTSAhWBnpQKHXDvDVEQjBwIBA&url=http%3A%2F%2Flogok.org%2Fwp-content%2Fuploads%2F2014%2F02%2FUnited_Airlines_earth-logo.png&psig=AFQjCNGuI-aUb-GCKBwufTCZYNGjXmAPqw&ust=1487883733152186")),
                    ])*/
                    .buttons([
                        //builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Indian_cuisine", "About the cuisine"),
                        builder.CardAction.imBack(session, "EWR:KUL", "Book Now")
                    ]),
            ]);  builder.Prompts.choice(session, msg, "EWR:KUL|ORD:MEL|select:102");
        },

        function (session) {
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Indian")
                    .text("The Indian India is one of the most densely populated countries on the planet. With so many people within the nation, Indian cuisine is highly varied. Curries are the traditional fare, but Indian food is not confined for just curry.")
                    .images([
                        builder.CardImage.create(session, "https://s3.scoopwhoop.com/dan/29/2.jpg")
                            .tap(builder.CardAction.showImage(session, "https://s3.scoopwhoop.com/dan/29/2.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Indian_cuisine", "About the cuisine"),
                        builder.CardAction.imBack(session, "select:Indian", "Buy Now: $8.99")
                    ]),
                new builder.HeroCard(session)
                    .title("Mexican")
                    .text("Mexican food is a common favorite cuisine in America. From chili con carne to enchiladas, spicy Mexican dishes are a popular choice.")
                    .images([
                        builder.CardImage.create(session, "http://vignette1.wikia.nocookie.net/foodtruck/images/e/ee/Tacos.jpeg/revision/latest/scale-to-width-down/670?cb=20130419221908")
                            .tap(builder.CardAction.showImage(session, "http://vignette1.wikia.nocookie.net/foodtruck/images/e/ee/Tacos.jpeg/revision/latest/scale-to-width-down/670?cb=20130419221908")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Mexican_cuisine", "About the cuisine"),
                        builder.CardAction.imBack(session, "select:Mexican", "Buy Now: $6.99")
                    ]),
                new builder.HeroCard(session)
                    .title("Italian")
                    .text("Italian with a culinary history that stretches back centuries, Italian cuisine is one of the world’s favorites. ")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/3/33/Spaghettata.JPG")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/3/33/Spaghettata.JPG"))
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Italian_cuisine", "About the cuisine"),
                        builder.CardAction.imBack(session, "select:Italian", "Buy Now: $7.99")
                    ])
            ]);
        builder.Prompts.choice(session, msg, "select:Indian|select:Mexican|select:Italian");
   },
    function (session, results) {
        var action, item;
        var kvPair = results.response.entity.split(':');
        switch (kvPair[0]) {
            case 'select':
                action = 'selected';
                break;
        }
        switch (kvPair[1]) {
            case 'Indian':
                item = "Indian Meal";
                var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title(session.userData.name)
                    .items([
                        builder.ReceiptItem.create(session, "$8.00", "Indian Meal").image(builder.CardImage.create(session, "https://s3.scoopwhoop.com/dan/29/2.jpg")),
                          ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        uilder.Fact.create(session, "UA 1795", "Flight Number"),
                    
                    ])
                    .tax("$0.99")
                    .total("$8.99")
            ]);
        session.send(msg);
                break;
            case 'Mexican':
                item = "Mexican Meal";
                var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title(session.userData.name)
                    .items([
                        builder.ReceiptItem.create(session, "$6.00", "Mexican Meal").image(builder.CardImage.create(session, "http://vignette1.wikia.nocookie.net/foodtruck/images/e/ee/Tacos.jpeg/revision/latest/scale-to-width-down/670?cb=20130419221908")),
                          ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        uilder.Fact.create(session, "UA 1795", "Flight Number"),
                    
                    ])
                    .tax("$0.99")
                    .total("$6.99")
            ]);
        session.send(msg);
                break;
            case 'Italian':
                item = "Italian Meal";
                var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title(session.userData.name)
                    .items([
                        builder.ReceiptItem.create(session, "$7.00", "Italian Meal").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/3/33/Spaghettata.JPG")),
                          ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        uilder.Fact.create(session, "UA 1795", "Flight Number"),
                    
                    ])
                    .tax("$0.99")
                    .total("$7.99")
            ]);
        session.send(msg);
                break;
        }
        session.endDialog("Thank You for placing the order");
    },  

]).reloadAction('reloadMenu', null, { matches: /^meal|show meal menu/i });

bot.dialog('/carousel2', [
        function (session) {
        session.send("Currently we are having great offers for Europe and North America....");
        builder.Prompts.text(session, "Please tell me the name of the city to which you want to fly, and I'll get you the best offers");
    },
    function (session, results) {
        var city=results.response.toLowerCase();
        if (city != 'paris'||'london'||'new york'||'ohio'||'sanfrancisco') {
        session.send("Sorry currently we have no offers for %s",results.response);
        builder.Prompts.choice(session, "We have some major offers for the following cities, would you be intrested", "paris|london|new york|ohio|sanfrancisco|(No Thanks)");
        } 
        else if(city == 'paris'||'london'||'new york'||'ohio'||'sanfrancisco'){
            next();
        }
        else {
            // Exit the menu
           
            session.endDialog();
        }
    },
     
    function (session, results) {
        if (results.response && results.response.entity != 'No Thanks)') {
            // Launch demo dialog
           // session.beginDialog('/' + results.response.entity);
           session.beginDialog('/paris');
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
   /* function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/carousel2');
    }*/
])//.reloadAction('reloadMenu', null, { matches: /^back|go back/i });
bot.dialog('/paris', [
    function (session) {
       // session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Paris: 1")
                    .text("Return Tickets")
                    .text("Journey Period: 1st March to 10th March '17")
                    
                    .images([
                        builder.CardImage.create(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")
                            .tap(builder.CardAction.showImage(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")),
                    ])
                    .buttons([
                        //builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:Paris1", "Buy Now for $599")
                    ]),
                     new builder.HeroCard(session)
                    .title("Paris: 2")
                    .text("Return Tickets")
                    .text("Journey Period: 1st March to 15th March '17")
                    
                    .images([
                        builder.CardImage.create(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")
                            .tap(builder.CardAction.showImage(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")),
                    ])
                    .buttons([
                        //builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:Paris2", "Buy Now for $699")
                    ]),
                     new builder.HeroCard(session)
                    .title("Paris: 3")
                    .text("Return Tickets")
                    .text("Journey Period: 1st March to 30th March '17")
                    
                    .images([
                        builder.CardImage.create(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")
                            .tap(builder.CardAction.showImage(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")),
                    ])
                    .buttons([
                        //builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:Paris3", "Buy Now for $799")
                    ]),
                    ]);
        builder.Prompts.choice(session, msg, "select:Paris1|select:Paris2|select:Paris3");
   },
    function (session, results) {
        var action, item;
        var kvPair = results.response.entity.split(':');
        switch (kvPair[0]) {
            case 'select':
                action = 'selected';
                break;
        }
        switch (kvPair[1]) {
            case 'Paris1':
                item = "Paris1";
                var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title(session.userData.name)
                    .items([
                        builder.ReceiptItem.create(session, "$499.00", "Paris:1").image(builder.CardImage.create(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")),
                          ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        uilder.Fact.create(session, "UA 1795", "Flight Number"),
                    
                    ])
                    .tax("$100.00")
                    .total("$599")
            ]);
        case 'Paris2':
                item = "Paris2";
                var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title(session.userData.name)
                    .items([
                        builder.ReceiptItem.create(session, "$599.00", "Paris:2").image(builder.CardImage.create(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")),
                          ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        builder.Fact.create(session, "UA 1795", "Flight Number"),
                    
                    ])
                    .tax("$100.00")
                    .total("$699")
            ]);
        case 'Paris3':
                item = "Paris3";
                var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title(session.userData.name)
                    .items([
                        builder.ReceiptItem.create(session, "$699.00", "Paris:3").image(builder.CardImage.create(session, "http://www.parisaddress.com/var/source/district/new/tour_eiffel-paris.jpg")),
                          ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        builder.Fact.create(session, "UA 1795", "Flight Number"),
                    
                    ])
                    .tax("$100.00")
                    .total("$799")
            ]);
        session.send(msg);
                break;
        }
       
        session.endDialog("Thank You for the booking.");
    }, 
   

]);
 //dialog.onDefault(builder.DialogAction.send("Sorry but I couldn't understand you.Type help for assistance"));
   
    
    
