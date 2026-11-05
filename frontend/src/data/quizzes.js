// Each round: choices[0] is the correct answer (shuffled on screen).
// Item types: {text}, {icon, color}, {shape, fill}, {img}; optional label.
const T = (text) => ({ text });
const I = (icon, color, label) => ({ icon, color, label });
const S = (shape, fill, label) => ({ shape, fill, label });

export const QUIZZES = {
  "count-the-stars": [3, 5, 2, 7, 4, 6].map((n) => ({
    title: "How many stars?",
    say: "Count the stars with me. Touch each one as you count. How many stars are there?",
    show: Array.from({ length: n }, () => I("Star", "sun")),
    choices: [T(String(n)), T(String(n + 1)), T(String(n - 1))],
    explain: `${Array.from({ length: n }, (_, i) => i + 1).join(", ")}. There are ${n} stars!`,
    hint: "Touch each star once and count out loud: 1, 2, 3...",
  })),
  "alphabet-adventures": [
    { title: "Find little b!", say: "This is big B. Can you find little b?", show: [T("B")], choices: [T("b"), T("d"), T("p")], explain: "Big B and little b are the same letter. B says buh!", hint: "Little b has a tall line with a round tummy on the right." },
    { title: "Find little m!", say: "This is big M. Can you find little m?", show: [T("M")], choices: [T("m"), T("n"), T("w")], explain: "Big M and little m! M says mmm.", hint: "Little m has two humps, like two little hills." },
    { title: "Find little a!", say: "This is big A. Can you find little a?", show: [T("A")], choices: [T("a"), T("e"), T("o")], explain: "Big A and little a! A is for apple.", hint: "Little a is round with a little line on its side." },
    { title: "Find little t!", say: "This is big T. Can you find little t?", show: [T("T")], choices: [T("t"), T("f"), T("l")], explain: "Big T and little t! T says tuh.", hint: "Little t looks like a small cross." },
    { title: "Find big G!", say: "This is little g. Can you find big G?", show: [T("g")], choices: [T("G"), T("C"), T("Q")], explain: "Little g and big G! G is for garden.", hint: "Big G looks like a C with a little shelf inside." },
    { title: "What comes after C?", say: "A, B, C. Which letter comes next?", show: [T("A"), T("B"), T("C")], blank: true, choices: [T("D"), T("E"), T("B")], explain: "A, B, C, D! Great alphabet singing!", hint: "Sing the alphabet song: A, B, C..." },
  ],
  "phonics-fun": [
    { title: "Which letter starts moon?", say: "Moon starts with the mmm sound. Which letter makes mmm?", show: [I("Moon", "lav", "moon")], choices: [T("M"), T("S"), T("T")], explain: "M says mmm, like moon!", hint: "Say it slowly: mmm-oon. Which letter hums mmm?" },
    { title: "Which letter starts sun?", say: "Sun starts with the sss sound, like a snake. Which letter is it?", show: [I("Sun", "sun", "sun")], choices: [T("S"), T("F"), T("R")], explain: "S says sss, like sun!", hint: "Hiss like a snake: sss. That letter is curvy!" },
    { title: "Which letter starts fish?", say: "Fish starts with the fff sound. Which letter makes fff?", show: [I("Fish", "sky", "fish")], choices: [T("F"), T("P"), T("H")], explain: "F says fff, like fish!", hint: "Bite your lip gently and blow: fff." },
    { title: "Which letter starts cat?", say: "Cat starts with the kuh sound. Which letter is it?", show: [I("Cat", "tang", "cat")], choices: [T("C"), T("D"), T("B")], explain: "C says kuh, like cat!", hint: "This letter looks like a round mouth, open on one side." },
    { title: "Which letter starts bus?", say: "Bus starts with the buh sound. Which letter makes buh?", show: [I("Bus", "sun", "bus")], choices: [T("B"), T("D"), T("P")], explain: "B says buh, like bus!", hint: "Press your lips together and pop: buh." },
    { title: "Which letter starts apple?", say: "Apple starts with the ah sound. Which letter is it?", show: [I("Apple", "coral", "apple")], choices: [T("A"), T("E"), T("U")], explain: "A says ah, like apple!", hint: "Open your mouth wide and say ah." },
  ],
  "first-words": [
    { title: "Which word is this?", say: "Look at the picture. Which word says cat?", show: [I("Cat", "tang")], choices: [T("cat"), T("can"), T("bat")], explain: "C, a, t. Cat!", hint: "Cat starts with c and ends with t." },
    { title: "Which word is this?", say: "Look at the picture. Which word says dog?", show: [I("Dog", "sun")], choices: [T("dog"), T("dig"), T("log")], explain: "D, o, g. Dog!", hint: "Dog starts with d. Look at the middle letter: o." },
    { title: "Which word is this?", say: "Look at the picture. Which word says sun?", show: [I("Sun", "sun")], choices: [T("sun"), T("run"), T("sat")], explain: "S, u, n. Sun!", hint: "Sun starts with the sss sound." },
    { title: "Which word is this?", say: "Look at the picture. Which word says bus?", show: [I("Bus", "sky")], choices: [T("bus"), T("bug"), T("bun")], explain: "B, u, s. Bus!", hint: "Bus ends with the sss sound." },
    { title: "Which word is this?", say: "Look at the picture. Which word says bed?", show: [I("Bed", "lav")], choices: [T("bed"), T("red"), T("bad")], explain: "B, e, d. Bed!", hint: "Bed starts with b and has e in the middle." },
    { title: "Which word is this?", say: "Look at the picture. Which word says box?", show: [I("Box", "tang")], choices: [T("box"), T("fox"), T("boy")], explain: "B, o, x. Box!", hint: "Box ends with x, which says ks." },
  ],
  "pattern-party": [
    { title: "What comes next?", say: "Red circle, blue square, red circle, blue square. What comes next?", show: [S("circle", "#FF7F91"), S("square", "#63BCF7"), S("circle", "#FF7F91"), S("square", "#63BCF7")], blank: true, choices: [S("circle", "#FF7F91", "red circle"), S("square", "#63BCF7", "blue square"), S("triangle", "#FFC93C", "yellow triangle")], explain: "Circle, square, circle, square, circle! You found the pattern!", hint: "Say it out loud: circle, square, circle, square..." },
    { title: "What comes next?", say: "Star, star, heart. Star, star... What comes next?", show: [S("star", "#FFC93C"), S("star", "#FFC93C"), S("heart", "#FF7F91"), S("star", "#FFC93C"), S("star", "#FFC93C")], blank: true, choices: [S("heart", "#FF7F91", "heart"), S("star", "#FFC93C", "star"), S("circle", "#3DD6A3", "circle")], explain: "Star, star, heart! The heart comes after two stars.", hint: "Look how many stars come before each heart." },
    { title: "What comes next?", say: "Green triangle, orange circle, green triangle, orange circle. What comes next?", show: [S("triangle", "#3DD6A3"), S("circle", "#FF9A52"), S("triangle", "#3DD6A3"), S("circle", "#FF9A52")], blank: true, choices: [S("triangle", "#3DD6A3", "green triangle"), S("circle", "#FF9A52", "orange circle"), S("square", "#C9B6FF", "purple square")], explain: "Triangle, circle, triangle, circle, triangle!", hint: "The pattern goes back to the start after the circle." },
    { title: "What comes next?", say: "1, 2, 1, 2, 1, 2. What comes next?", show: [T("1"), T("2"), T("1"), T("2"), T("1"), T("2")], blank: true, choices: [T("1"), T("2"), T("3")], explain: "1, 2, 1, 2, 1! Number patterns are fun!", hint: "After 2 the pattern starts again." },
    { title: "What comes next?", say: "Square, square, triangle. Square, square... What comes next?", show: [S("square", "#C9B6FF"), S("square", "#C9B6FF"), S("triangle", "#63BCF7"), S("square", "#C9B6FF"), S("square", "#C9B6FF")], blank: true, choices: [S("triangle", "#63BCF7", "blue triangle"), S("square", "#C9B6FF", "purple square"), S("heart", "#FF7F91", "heart")], explain: "Square, square, triangle! Brilliant!", hint: "Count the squares before each triangle." },
  ],
  "odd-one-out": [
    { title: "Which one does not belong?", say: "Apple, banana, cherry and car. Which one does not belong?", fixed: true, choices: [I("Car", "sky", "car"), I("Apple", "coral", "apple"), I("Banana", "sun", "banana"), I("Cherry", "coral", "cherry")], explain: "The car is not a fruit! Apples, bananas and cherries are fruits.", hint: "Three of these are things you can eat." },
    { title: "Which one does not belong?", say: "Cat, dog, rabbit and pencil. Which one does not belong?", fixed: true, choices: [I("Pencil", "sun", "pencil"), I("Cat", "tang", "cat"), I("Dog", "sun", "dog"), I("Rabbit", "lav", "rabbit")], explain: "The pencil is not an animal!", hint: "Three of these can run and play." },
    { title: "Which one does not belong?", say: "Find the shape that is different.", fixed: true, choices: [S("square", "#FFC93C", "square"), S("circle", "#FF7F91", "circle"), S("circle", "#63BCF7", "circle"), S("circle", "#3DD6A3", "circle")], explain: "The square is different. The others are all circles!", hint: "Look at the shapes, not the colours." },
    { title: "Which one does not belong?", say: "Sun, cloud, rain and fish. Which one does not belong?", fixed: true, choices: [I("Fish", "sky", "fish"), I("Sun", "sun", "sun"), I("Cloud", "lav", "cloud"), I("CloudRain", "sky", "rain")], explain: "The fish is an animal. Sun, cloud and rain are weather!", hint: "Three of these are up in the sky." },
    { title: "Which one does not belong?", say: "2, 4, 6 and B. Which one does not belong?", fixed: true, choices: [T("B"), T("2"), T("4"), T("6")], explain: "B is a letter. 2, 4 and 6 are numbers!", hint: "Three of these are numbers." },
  ],
  "shape-match": [
    { title: "Find the same shape!", say: "Look at this shape. Find the same shape.", show: [S("triangle", "#fff")], choices: [S("triangle", "#3DD6A3", "triangle"), S("circle", "#3DD6A3", "circle"), S("square", "#3DD6A3", "square")], explain: "A triangle! It has 3 sides and 3 corners.", hint: "Count the corners: 1, 2, 3." },
    { title: "Find the same shape!", say: "Look at this shape. Find the same shape.", show: [S("star", "#fff")], choices: [S("star", "#FFC93C", "star"), S("heart", "#FFC93C", "heart"), S("diamond", "#FFC93C", "diamond")], explain: "A star! It has 5 pointy points.", hint: "Look for the pointy points." },
    { title: "Find the same shape!", say: "Look at this shape. Find the same shape.", show: [S("heart", "#fff")], choices: [S("heart", "#FF7F91", "heart"), S("circle", "#FF7F91", "circle"), S("triangle", "#FF7F91", "triangle")], explain: "A heart! Hearts mean love.", hint: "It has two round bumps on top." },
    { title: "Find the same shape!", say: "Look at this shape. Find the same shape.", show: [S("circle", "#fff")], choices: [S("circle", "#63BCF7", "circle"), S("square", "#63BCF7", "square"), S("diamond", "#63BCF7", "diamond")], explain: "A circle! It is round with no corners.", hint: "This shape has no corners at all." },
    { title: "Which shape has 4 equal sides?", say: "Which shape has four sides that are all the same?", choices: [S("square", "#C9B6FF", "square"), S("triangle", "#C9B6FF", "triangle"), S("circle", "#C9B6FF", "circle")], explain: "A square has 4 equal sides and 4 corners!", hint: "Count the sides of each shape." },
  ],
  "animal-homes": [
    { title: "Where does a fish live?", say: "Where does a fish live?", show: [I("Fish", "sky", "fish")], choices: [I("Waves", "sky", "in water"), I("TreePine", "mint", "in a tree"), I("House", "tang", "in a house")], explain: "Fish live in water. They breathe with gills!", hint: "Fish love to swim and splash." },
    { title: "Where does a bird make its nest?", say: "Where does a bird make its nest?", show: [I("Bird", "sun", "bird")], choices: [I("TreePine", "mint", "in a tree"), I("Waves", "sky", "in the sea"), I("Car", "coral", "in a car")], explain: "Many birds build nests high up in trees!", hint: "Birds fly up high and rest on branches." },
    { title: "Where does a rabbit sleep?", say: "Where does a wild rabbit sleep?", show: [I("Rabbit", "lav", "rabbit")], choices: [I("Sprout", "mint", "in a burrow"), I("Cloud", "sky", "on a cloud"), I("Waves", "sky", "under the sea")], explain: "Rabbits dig burrows under the ground to stay safe and cosy!", hint: "Rabbits are great diggers." },
    { title: "Which animal can fly?", say: "Which animal can fly?", choices: [I("Bird", "sun", "bird"), I("Fish", "sky", "fish"), I("Turtle", "mint", "turtle")], explain: "Birds have wings and feathers to fly!", hint: "Look for the animal with wings." },
    { title: "Which animal has a shell?", say: "Which animal carries a shell on its back?", choices: [I("Snail", "tang", "snail"), I("Dog", "sun", "dog"), I("Bird", "sky", "bird")], explain: "A snail carries its shell home everywhere it goes!", hint: "This animal is slow and leaves a shiny trail." },
  ],
  "my-body": [
    { title: "What do we see with?", say: "What do we see with?", choices: [I("Eye", "sky", "eyes"), I("Ear", "coral", "ears"), I("Hand", "sun", "hands")], explain: "We see with our eyes!", hint: "You blink these." },
    { title: "What do we hear with?", say: "What do we hear music with?", choices: [I("Ear", "coral", "ears"), I("Eye", "sky", "eyes"), I("Footprints", "tang", "feet")], explain: "We hear with our ears!", hint: "They are on the sides of your head." },
    { title: "What do we touch with?", say: "What do we use to touch and feel things?", choices: [I("Hand", "sun", "hands"), I("Ear", "coral", "ears"), I("Eye", "sky", "eyes")], explain: "We touch and feel with our hands and fingers!", hint: "You wave hello with these." },
    { title: "Which food helps you grow strong?", say: "Which food is healthy?", choices: [I("Apple", "mint", "apple"), I("Candy", "coral", "sweets"), I("Lollipop", "lav", "lollipop")], explain: "Apples and other fruits help your body grow strong!", hint: "This food grows on a tree." },
    { title: "Which part helps you think?", say: "Which part of your body helps you think and learn?", choices: [I("Brain", "coral", "brain"), I("Footprints", "tang", "feet"), I("Hand", "sun", "hands")], explain: "Your brain helps you think, learn and remember!", hint: "It is inside your head." },
  ],
  "music-and-moves": [
    { title: "What makes a beat?", say: "When you clap your hands, you make a beat! Can you clap along? What makes a beat?", show: [I("Hand", "coral", "clap")], choices: [I("Hand", "coral", "clapping hands"), I("Sun", "sun", "the sun"), I("TreePine", "mint", "a tree")], explain: "Clapping your hands makes a beat! Beats are the heart of music.", hint: "You use your hands to do this." },
    { title: "Which animal hops?", say: "Some animals move to the music! Which animal hops up and down?", choices: [I("Rabbit", "lav", "rabbit"), I("Fish", "sky", "fish"), I("Snail", "tang", "snail")], explain: "Rabbits hop! Hopping is like jumping to the beat.", hint: "This animal has long ears and loves to jump." },
    { title: "How do we dance?", say: "When music plays, what do we do with our body?", choices: [I("Footprints", "tang", "dance and move"), I("Bed", "lav", "go to sleep"), I("BookOpen", "sky", "read a book")], explain: "We dance and move our bodies when we hear music!", hint: "Music makes your feet want to move." },
    { title: "What is singing?", say: "When we use our voice to make music, what is it called?", choices: [T("singing"), T("whispering"), T("crying")], explain: "Singing is making music with your voice! La la la!", hint: "You do this when your favourite song comes on." },
    { title: "Which one is a musical instrument?", say: "Which of these is a musical instrument you can play?", choices: [I("Music", "sun", "drum"), I("Apple", "coral", "apple"), I("Car", "sky", "car")], explain: "A drum is a musical instrument! You hit it to make music.", hint: "You hit this to make a beat." },
    { title: "How does fast music feel?", say: "When music is very fast, how does it make you want to move?", choices: [T("fast, like running"), T("slow, like sleeping"), T("quiet, like whispering")], explain: "Fast music makes us want to move quickly, like running or jumping!", hint: "Fast music makes your heart go thump thump thump!" },
  ],
  "weather-and-sky": [
    { title: "What do we need on a rainy day?", say: "What do we need on a rainy day?", show: [I("CloudRain", "sky", "rain")], choices: [I("Umbrella", "coral", "umbrella"), I("IceCreamCone", "sun", "ice cream"), I("Sun", "sun", "sunshine")], explain: "An umbrella keeps us dry in the rain!", hint: "You hold it over your head." },
    { title: "What falls when it is very cold?", say: "What falls from the clouds when it is very cold?", choices: [I("Snowflake", "sky", "snow"), I("Flower2", "coral", "flowers"), I("Leaf", "mint", "leaves")], explain: "When it is very cold, snow falls from the clouds!", hint: "It is white and you can build a snowman with it." },
    { title: "What shines in the day?", say: "What shines in the sky during the day?", choices: [I("Sun", "sun", "sun"), I("Moon", "lav", "moon"), I("Star", "sun", "stars")], explain: "The sun shines in the day and keeps us warm!", hint: "It is big, bright and warm." },
    { title: "What do we see at night?", say: "What do we see in the sky at night?", choices: [I("Moon", "lav", "moon"), I("Sun", "sun", "sun"), I("Rainbow", "sky", "rainbow")], explain: "We can see the moon at night!", hint: "It glows when it is time for bed." },
    { title: "Which planet do we live on?", say: "Which planet do we live on?", choices: [I("Globe", "mint", "Earth"), I("Rocket", "coral", "rocket"), I("Star", "sun", "star")], explain: "We live on planet Earth, with land and oceans!", hint: "It is blue and green, with oceans and land." },
    { title: "What does a plant need to grow?", say: "What does a plant need to grow?", show: [I("Sprout", "mint", "plant")], choices: [I("Droplets", "sky", "water"), I("Candy", "coral", "sweets"), I("Car", "tang", "a car")], explain: "Plants need water, sunlight and soil to grow!", hint: "We pour it from a watering can." },
  ],
};
