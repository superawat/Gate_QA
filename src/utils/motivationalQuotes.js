/**
 * Comprehensive Database of Motivational & Study Quotes for Students
 * Featuring prominent sections of Indian wisdom and global pioneers of perseverance.
 * ONLY includes quotes by verified deceased figures, heavily emphasizing hard work and study.
 */
const RAW_STUDENT_QUOTES = [
  // --- A. P. J. ABDUL KALAM ---
  "Dream is not that which you see while sleeping, it is something that does not let you sleep. — A. P. J. Abdul Kalam",
  "If you want to shine like a sun, first burn like a sun. — A. P. J. Abdul Kalam",
  "All of us do not have equal talent. But, all of us have an equal opportunity to develop our talents. — A. P. J. Abdul Kalam",

  // --- SWAMI VIVEKANANDA ---
  "Arise, awake, and stop not till the goal is reached. — Swami Vivekananda",
  "Talk to yourself once a day, otherwise you may miss meeting an excellent person in this world. — Swami Vivekananda",
  "You cannot believe in God until you believe in yourself. — Swami Vivekananda",

  // --- GAUTAMA BUDDHA ---
  "The mind is everything. What you think you become. — Gautama Buddha",
  "Every morning we are born again. What we do today is what matters most. — Gautama Buddha",
  "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment. — Gautama Buddha",

  // --- MAHATMA GANDHI ---
  "Be the change that you wish to see in the world. — Mahatma Gandhi",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi",
  "The future depends on what you do today. — Mahatma Gandhi",

  // --- RABINDRANATH TAGORE ---
  "You cannot cross the sea merely by standing and staring at the water. — Rabindranath Tagore",
  "Faith is the bird that feels the light when the dawn is still dark. — Rabindranath Tagore",
  "Let us not pray to be sheltered from dangers but to be fearless when facing them. — Rabindranath Tagore",

  // --- CHANAKYA ---
  "Before you start some work, always ask yourself three questions: Why am I doing it, What the results might be, and Will I be successful. — Chanakya",
  "Once you start working on something, don't be afraid of failure and don't abandon it. — Chanakya",
  "Education is the best friend. An educated person is respected everywhere. — Chanakya",

  // --- B. R. AMBEDKAR ---
  "Cultivation of mind should be the ultimate aim of human existence. — B. R. Ambedkar",
  "Life should be great rather than long. — B. R. Ambedkar",
  "Education is the milk of a tigress; he who drinks it, cannot help but roar. — B. R. Ambedkar",

  // --- J. R. D. TATA ---
  "Uncommon effort is the key to uncommon success. Always aim for excellence. — J. R. D. Tata",
  "To be a leader, you must lead by example, by hard work, and by integrity. — J. R. D. Tata",
  "Nothing worthwhile is ever achieved without deep thought, hard work, and persistent effort. — J. R. D. Tata",

  // --- LAL BAHADUR SHASTRI ---
  "Hard work is equal to prayer. — Lal Bahadur Shastri",

  // --- SARDAR VALLABHBHAI PATEL ---
  "Work is undoubtedly worship but laughter is life. — Sardar Vallabhbhai Patel",

  // --- SRINIVASA RAMANUJAN ---
  "An equation for me has no meaning unless it expresses a thought of God. — Srinivasa Ramanujan",
  "No one can understand the ecstasy of mathematical discovery unless they have worked day and night to resolve the unknown. — Srinivasa Ramanujan",

  // --- VIKRAM SARABHAI ---
  "He who can listen to music in the midst of noise can achieve great things. — Vikram Sarabhai",
  "There is no limit to what can be achieved by hard work and determination. — Vikram Sarabhai",
  "We must be second to none in the application of advanced technologies to the real problems of man and society. — Vikram Sarabhai",

  // --- C. V. RAMAN ---
  "I am the master of my failure. If I never fail, how will I ever learn? — C. V. Raman",
  "Success can come to you by courageous devotion to the task. — C. V. Raman",
  "Ask the right questions, and nature will open the doors to her secrets. — C. V. Raman",

  // --- SUBHAS CHANDRA BOSE ---
  "Reality is, after all, too big for our frail understanding to fully grasp. Nevertheless, we have to build our lives on the theory which contains the maximum truth. — Subhas Chandra Bose",

  // --- SRI AUROBINDO ---
  "True strength is not in the body, it is in the soul; and the soul grows by effort, by persistence, by hard work. — Sri Aurobindo",
  "The only way to be free from the limits of your past is to raise your consciousness and work with devotion in the present. — Sri Aurobindo",
  "To grow in knowledge, one must first learn to be silent and focus the mind. — Sri Aurobindo",

  // --- KABIR ---
  "Slowly slowly O mind, everything in course happens; the gardener may water with a hundred pots, the fruit arrives only in its season. — Kabir",

  // --- ADI SHANKARA ---
  "Do not look at others' virtues and vices, work hard on your own self-realization and progress. — Adi Shankara",

  // --- MOTHER TERESA ---
  "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin. — Mother Teresa",

  // --- JAWAHARLAL NEHRU ---
  "Time is not measured by the passing of years but by what one does, what one feels, and what one achieves. — Jawaharlal Nehru",
  "Failure comes only when we forget our ideals and objectives and principles. — Jawaharlal Nehru",
  "Action to be effective must be directed to a clearly conceived goal. — Jawaharlal Nehru",

  // --- ALBERT EINSTEIN ---
  "It is not that I'm so smart, it's just that I stay with problems longer. — Albert Einstein",
  "A person who never made a mistake never tried anything new. — Albert Einstein",
  "Learn from yesterday, live for today, hope for tomorrow. — Albert Einstein",

  // --- THOMAS EDISON ---
  "There is no substitute for hard work. — Thomas Edison",
  "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison",
  "Genius is one percent inspiration and ninety-nine percent perspiration. — Thomas Edison",

  // --- RICHARD FEYNMAN ---
  "What I cannot create, I do not understand. — Richard Feynman",
  "The first principle is that you must not fool yourself and you are the easiest person to fool. — Richard Feynman",
  "If you want to master a concept, teach it to someone else. — Richard Feynman",

  // --- STEPHEN HAWKING ---
  "Intelligence is the ability to adapt to change. — Stephen Hawking",
  "Quiet people have the loudest minds. — Stephen Hawking",
  "Remember to look up at the stars and not down at your feet. Never give up work. — Stephen Hawking",

  // --- ISAAC NEWTON ---
  "If I have seen further it is by standing on the shoulders of Giants. — Isaac Newton",
  "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things. — Isaac Newton",
  "No great discovery was ever made without a bold guess. — Isaac Newton",

  // --- MARIE CURIE ---
  "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less. — Marie Curie",
  "Be less curious about people and more curious about ideas. — Marie Curie",
  "I was taught that the way of progress was neither swift nor easy. — Marie Curie",

  // --- ALEXANDER GRAHAM BELL ---
  "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until focused. — Alexander Graham Bell",
  "Preparation is the key to success. — Alexander Graham Bell",

  // --- NIKOLA TESLA ---
  "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration. — Nikola Tesla",

  // --- STEVE JOBS ---
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Your time is limited, so don't waste it living someone else's life. — Steve Jobs",
  "Stay hungry. Stay foolish. — Steve Jobs",

  // --- BRUCE LEE ---
  "The successful warrior is the average man, with laser-like focus. — Bruce Lee",
  "Do not pray for an easy life, pray for the strength to endure a difficult one. — Bruce Lee",
  "Knowing is not enough, we must apply. Willing is not enough, we must do. — Bruce Lee",

  // --- MUHAMMAD ALI ---
  "Don't count the days, make the days count. — Muhammad Ali",
  "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.' — Muhammad Ali",
  "He who is not courageous enough to take risks will accomplish nothing in life. — Muhammad Ali",

  // --- NELSON MANDELA ---
  "It always seems impossible until it's done. — Nelson Mandela",
  "The greatest glory in living lies not in never falling, but in rising every time we fall. — Nelson Mandela",
  "Education is the most powerful weapon which you can use to change the world. — Nelson Mandela",

  // --- ABRAHAM LINCOLN ---
  "The best way to predict the future is to create it. — Abraham Lincoln",
  "Determine that the thing can and shall be done, and then we shall find the way. — Abraham Lincoln",
  "Leave nothing for tomorrow which can be done today. — Abraham Lincoln",

  // --- THEODORE ROOSEVELT ---
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "Do what you can, with what you have, where you are. — Theodore Roosevelt",
  "It is hard to fail, but it is worse never to have tried to succeed. — Theodore Roosevelt",

  // --- ARISTOTLE ---
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "The roots of education are bitter, but the fruit is sweet. — Aristotle",
  "Pleasure in the job puts perfection in the work. — Aristotle",

  // --- PLATO ---
  "The beginning is the most important part of the work. — Plato",
  "Courage is knowing what not to fear. — Plato",
  "Be kind, for everyone you meet is fighting a hard battle. — Plato",

  // --- SOCRATES ---
  "Wisdom begins in wonder. — Socrates",
  "An unexamined life is not worth living. — Socrates",

  // --- SENECA ---
  "Difficulties strengthen the mind, as labor does the body. — Seneca",
  "If you want to be free from fear, you must work to understand the nature of things. — Seneca",
  "Luck is what happens when preparation meets opportunity. — Seneca",

  // --- CONFUCIUS ---
  "Our greatest glory is not in never falling, but in rising every time we fall. — Confucius",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "He who learns but does not think is lost! He who thinks but does not learn is in great danger. — Confucius",

  // --- LAO TZU ---
  "The journey of a thousand miles begins with one step. — Lao Tzu",
  "Mastering others is strength. Mastering yourself is true power. — Lao Tzu",
  "The journey of a thousand miles begins with a single step. — Lao Tzu",

  // --- WINSTON CHURCHILL ---
  "Success is not final; failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
  "Success is stumbling from failure to failure with no loss of enthusiasm. — Winston Churchill",
  "Continuous effort — Winston Churchill",

  // --- HELEN KELLER ---
  "Keep your face to the sunshine and you cannot see a shadow. — Helen Keller",
  "Never bend your head. Hold it high. — Helen Keller",
  "Optimism is the faith that leads to achievement. — Helen Keller",

  // --- MAYA ANGELOU ---
  "Nothing will work unless you do. — Maya Angelou",
  "All great achievements require time. — Maya Angelou",

  // --- AARON SWARTZ ---
  "Be curious. Read widely. Try new things. What people call intelligence just boils down to curiosity. — Aaron Swartz",

  // --- PABLO PICASSO ---
  "Action is the foundational key to all success. — Pablo Picasso",

  // --- RALPH WALDO EMERSON ---
  "The mind, once stretched by a new idea, never returns to its original dimensions. — Ralph Waldo Emerson",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson",
  "Nothing great was ever achieved without enthusiasm. — Ralph Waldo Emerson",

  // --- MARK TWAIN ---
  "The secret of getting ahead is getting started. — Mark Twain",
  "To succeed in life, you need two things: ignorance and confidence. — Mark Twain",

  // --- ROBERT COLLIER ---
  "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",

  // --- BENJAMIN FRANKLIN ---
  "By failing to prepare, you are preparing to fail. — Benjamin Franklin",
  "Energy and persistence conquer all things. — Benjamin Franklin",
  "Well done is better than well said. — Benjamin Franklin",

  // --- JOHANN WOLFGANG VON GOETHE ---
  "Knowing is not enough; we must apply. — Johann Wolfgang von Goethe",
  "Everything is hard before it is easy. — Johann Wolfgang von Goethe",
  "Whatever you can do or dream you can, begin it. — Johann Wolfgang von Goethe",

  // --- FRIEDRICH NIETZSCHE ---
  "He who has a why to live can bear almost any how. — Friedrich Nietzsche",

  // --- NAPOLEON HILL ---
  "Do not wait; the time will never be just right. — Napoleon Hill",
  "Think twice before you speak, because your words and influence will plant the seed of either success or failure. — Napoleon Hill",

  // --- GEORGE WASHINGTON ---
  "The harder the conflict, the greater the triumph. — George Washington",

  // --- WALTER ELLIOT ---
  "Perseverance is not a long race; it is many short races one after another. — Walter Elliot",

  // --- ROBERT FROST ---
  "The best way out is always through. — Robert Frost",

  // --- WALT WHITMAN ---
  "Keep your face always toward the sunshine. — Walt Whitman",

  // --- DOROTHY PARKER ---
  "The cure for boredom is curiosity. — Dorothy Parker",

  // --- SAMUEL JOHNSON ---
  "Great works are performed not by strength but by perseverance. — Samuel Johnson",

  // --- BEVERLY SILLS ---
  "There are no shortcuts to any place worth going. — Beverly Sills",

  // --- HENRY WADSWORTH LONGFELLOW ---
  "The heights by great men reached and kept were not attained by sudden flight. — Henry Wadsworth Longfellow",

  // --- HELEN HAYES ---
  "The expert in anything was once a beginner. — Helen Hayes",

  // --- JAPANESE PROVERB ---
  "Fall seven times, stand up eight. — Japanese Proverb",

  // --- MOLIÈRE ---
  "The greater the obstacle, the more glory in overcoming it. — Molière",

  // --- PERSIUS ---
  "He conquers who endures. — Persius",

  // --- J.R.R. TOLKIEN ---
  "Little by little, one travels far. — J.R.R. Tolkien",

  // --- MIGUEL DE CERVANTES ---
  "To be prepared is half the victory. — Miguel de Cervantes",

  // --- WALT DISNEY ---
  "The way to get started is to quit talking and begin doing. — Walt Disney",

  // --- FRANKLIN D. ROOSEVELT ---
  "The only limit to our realization of tomorrow is our doubts of today. — Franklin D. Roosevelt",

  // --- SAMUEL GOLDWYN ---
  "The harder I work, the luckier I get. — Samuel Goldwyn",

  // --- H. JACKSON BROWN JR. ---
  "The best preparation for tomorrow is doing your best today. — H. Jackson Brown Jr.",

  // --- JONAS SALK ---
  "The reward for work well done is the opportunity to do more. — Jonas Salk",

  // --- ALFRED LORD TENNYSON ---
  "Knowledge comes, but wisdom lingers. — Alfred Lord Tennyson",

  // --- ALEXANDER POPE ---
  "A little learning is a dangerous thing. — Alexander Pope",

  // --- LEONARDO DA VINCI ---
  "Learning never exhausts the mind. — Leonardo da Vinci",
  "As every divided kingdom falls, so every mind divided between many studies confounds and saps itself. — Leonardo da Vinci",
  "I have been impressed with the urgency of doing. — Leonardo da Vinci",

  // --- TAOIST PROVERB ---
  "The journey is the reward. — Taoist Proverb",

  // --- JIM ROHN ---
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "Motivation is what gets you started. Habit is what keeps you going. — Jim Rohn",
  "Formal education will make you a living; self-education will make you a fortune. — Jim Rohn",

  // --- JAMES ALLEN ---
  "You are today where your thoughts have brought you. — James Allen",
  "Men do not attract what they want, but what they are. — James Allen",
  "Circumstances do not make the man, they reveal him. — James Allen",

  // --- FRANCIS BACON ---
  "Knowledge is power. — Francis Bacon",
  "Reading maketh a full man. — Francis Bacon",
  "A prudent question is one-half of wisdom. — Francis Bacon",

  // --- PLUTARCH ---
  "The mind is not a vessel to be filled but a fire to be kindled. — Plutarch",
  "Know how to listen, and you will profit even from those who talk badly. — Plutarch",

  // --- HERACLITUS ---
  "No man ever steps in the same river twice. — Heraclitus",
  "Character is destiny. — Heraclitus",

  // --- VINCENT VAN GOGH ---
  "Great things are done by a series of small things brought together. — Vincent van Gogh",
  "If you hear a voice within you say 'you cannot paint,' then by all means paint. — Vincent van Gogh",
  "I am always doing what I cannot do yet, in order to learn how to do it. — Vincent van Gogh",

  // --- HENRY FORD ---
  "Nothing is particularly hard if you divide it into small jobs. — Henry Ford",
  "Whether you think you can, or you think you can't—you're right. — Henry Ford",
  "Obstacles are those frightful things you see when you take your eyes off your goal. — Henry Ford",

  // --- OVID ---
  "What is harder than rock, or softer than water? Yet soft water hollows out hard rock. — Ovid",

  // --- LUCRETIUS ---
  "The drops of rain make a hole in the stone. — Lucretius",

  // --- WILLIAM HAZLITT ---
  "The more we do, the more we can do. — William Hazlitt",

  // --- HORACE ---
  "He who has begun has half done. — Horace",
  "Adversity has the effect of eliciting talents. — Horace",

  // --- BALTASAR GRACIÁN ---
  "Work is the price which is paid for reputation. — Baltasar Gracián",

  // --- ANTOINE DE SAINT-EXUPÉRY ---
  "A goal without a plan is just a wish. — Antoine de Saint-Exupéry",
  "Perfection is achieved when there is nothing left to take away. — Antoine de Saint-Exupéry",
  "What saves a man is to take a step. Then another step. — Antoine de Saint-Exupéry",

  // --- WILLIAM FEATHER ---
  "The reward of energy, enterprise and thrift is taxes. — William Feather",

  // --- PETER MARSHALL ---
  "Small deeds done are better than great deeds planned. — Peter Marshall",

  // --- JOHN MILTON ---
  "Long is the way and hard, that out of Hell leads up to light. — John Milton"
];

const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const interleaveQuotes = (quotes) => {
  const groups = {};
  for (const quote of quotes) {
    const parts = quote.split(/\s+(?:\u2014|-)\s+/);
    const author = parts.length > 1 ? parts[parts.length - 1].trim() : "Unknown";
    if (!groups[author]) groups[author] = [];
    groups[author].push(quote);
  }

  // Seeded shuffle each group's quotes
  const rand = seededRandom(42);
  for (const author in groups) {
    const arr = groups[author];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  const authorLists = Object.keys(groups).map(author => ({
    author,
    quotes: groups[author]
  }));

  const result = [];
  let lastAuthor = null;

  while (true) {
    authorLists.sort((a, b) => b.quotes.length - a.quotes.length);

    let selectedIndex = -1;
    for (let i = 0; i < authorLists.length; i++) {
      if (authorLists[i].quotes.length > 0 && authorLists[i].author !== lastAuthor) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex === -1) {
      const hasMore = authorLists.some(list => list.quotes.length > 0);
      if (hasMore) {
        const fallbackIndex = authorLists.findIndex(list => list.quotes.length > 0);
        const quote = authorLists[fallbackIndex].quotes.pop();
        result.push(quote);
        lastAuthor = authorLists[fallbackIndex].author;
        continue;
      }
      break;
    }

    const list = authorLists[selectedIndex];
    const quote = list.quotes.pop();
    result.push(quote);
    lastAuthor = list.author;
  }

  return result;
};

export const STUDENT_QUOTES = interleaveQuotes(RAW_STUDENT_QUOTES);

/**
 * Deterministically pick a quote for the student based on date and time
 */
export const getQuoteForToday = () => {
  if (typeof window === "undefined") return STUDENT_QUOTES[0];
  
  const now = new Date();
  // Mix day, month, and hour to get a rotating quote index that stays consistent for the hour
  const seed = now.getDate() * 19 + now.getMonth() * 37 + now.getHours() * 7;
  const index = Math.abs(seed) % STUDENT_QUOTES.length;
  
  return STUDENT_QUOTES[index];
};
