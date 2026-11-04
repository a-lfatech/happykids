const I = (icon, color, label) => ({ icon, color, label });
const C = (img, label) => ({ img, label });
const S = (shape, fill, label) => ({ shape, fill, label });

export const STORIES = {
  "little-sentences": {
    title: "Little Sentences",
    pages: [
      { text: "The cat sat on a mat.", img: "/hk/finn.png", icon: "Cat", bg: "bg-hc-tanglight" },
      { text: "The dog can run and run.", img: "/hk/froggy.png", icon: "Dog", bg: "bg-hc-sunlight" },
      { text: "The sun is hot.", img: "/hk/sunny.png", icon: "Sun", bg: "bg-hc-sunlight" },
      { text: "I can see a big red bus.", img: "/hk/ellie.png", icon: "Bus", bg: "bg-hc-skylight" },
      { text: "A fox sat in a box.", img: "/hk/finn.png", icon: "Box", bg: "bg-hc-mintlight" },
    ],
    questions: [
      { title: "Who sat on the mat?", say: "Who sat on the mat?", choices: [I("Cat", "tang", "the cat"), I("Dog", "sun", "the dog"), I("Bus", "sky", "the bus")], explain: "The cat sat on a mat!", hint: "Look back at the first sentence: The cat sat..." },
      { title: "What is hot?", say: "What is hot?", choices: [I("Sun", "sun", "the sun"), I("Snowflake", "sky", "snow"), I("Fish", "sky", "a fish")], explain: "The sun is hot!", hint: "It shines in the sky." },
      { title: "What colour was the bus?", say: "What colour was the big bus?", choices: [S("circle", "#F0484E", "red"), S("circle", "#3B9BEA", "blue"), S("circle", "#3DBE6A", "green")], explain: "I can see a big red bus!", hint: "Read the bus sentence again: a big ... bus." },
    ],
  },
  "hoppys-lost-carrot": {
    title: "Hoppy's Lost Carrot",
    pages: [
      { text: "Hoppy the bunny had a big orange carrot.", img: "/hk/hoppy.png", icon: "Carrot", bg: "bg-hc-tanglight" },
      { text: "One sunny day, the carrot was gone!", img: "/hk/hoppy_think.png", icon: "Sun", bg: "bg-hc-sunlight" },
      { text: "Froggy said, \"Let's look by the pond.\"", img: "/hk/froggy.png", icon: "Waves", bg: "bg-hc-skylight" },
      { text: "Sunny looked under the tree. \"I found it!\"", img: "/hk/sunny.png", icon: "TreePine", bg: "bg-hc-mintlight" },
      { text: "Hoppy shared the carrot with all his friends.", img: "/hk/hoppy.png", icon: "Heart", bg: "bg-hc-corallight" },
    ],
    questions: [
      { title: "Who lost the carrot?", say: "Who lost the carrot?", choices: [C("/hk/hoppy.png", "Hoppy"), C("/hk/froggy.png", "Froggy"), C("/hk/sunny.png", "Sunny")], explain: "Hoppy lost the carrot!", hint: "Think about the first page of the story." },
      { title: "What colour was the carrot?", say: "What colour was the carrot?", choices: [S("circle", "#FF9A52", "orange"), S("circle", "#63BCF7", "blue"), S("circle", "#C9B6FF", "purple")], explain: "The carrot was orange!", hint: "Carrots are the same colour as a tangerine." },
      { title: "Who found the carrot?", say: "Who found the carrot under the tree?", choices: [C("/hk/sunny.png", "Sunny"), C("/hk/hoppy.png", "Hoppy"), C("/hk/froggy.png", "Froggy")], explain: "Sunny found it under the tree!", hint: "Who looked under the tree?" },
    ],
  },
  "froggy-and-the-rain": {
    title: "Froggy and the Rain",
    pages: [
      { text: "Froggy likes rainy days.", img: "/hk/froggy.png", icon: "CloudRain", bg: "bg-hc-skylight" },
      { text: "Drip, drop! The rain fell on the pond.", img: "/hk/froggy_think.png", icon: "Droplets", bg: "bg-hc-skylight" },
      { text: "Froggy jumped from one big leaf to the next.", img: "/hk/froggy.png", icon: "Leaf", bg: "bg-hc-mintlight" },
      { text: "Then the sun came out and made a rainbow.", img: "/hk/sunny.png", icon: "Rainbow", bg: "bg-hc-sunlight" },
      { text: "Froggy smiled. \"What a happy day!\"", img: "/hk/froggy.png", icon: "Smile", bg: "bg-hc-lavlight" },
    ],
    questions: [
      { title: "What does Froggy like?", say: "What kind of days does Froggy like?", choices: [I("CloudRain", "sky", "rainy days"), I("Snowflake", "lav", "snowy days"), I("Wind", "mint", "windy days")], explain: "Froggy likes rainy days!", hint: "Listen to the first page again." },
      { title: "Where did the rain fall?", say: "Where did the rain fall?", choices: [I("Waves", "sky", "on the pond"), I("House", "tang", "on a house"), I("Car", "coral", "on a car")], explain: "Drip, drop! The rain fell on the pond.", hint: "Froggy lives near water." },
      { title: "What came out after the rain?", say: "What did the sun make after the rain?", choices: [I("Rainbow", "sun", "a rainbow"), I("Moon", "lav", "the moon"), I("Snowflake", "sky", "snow")], explain: "The sun made a beautiful rainbow!", hint: "It has lots of colours in the sky." },
    ],
  },
};
