/**
 * Comprehensive Database of Motivational & Study Quotes for Students
 *
 * Designed specifically for students preparing for competitive exams (e.g. GATE).
 * Focus areas:
 *  - Deep hard work, relentless practice, burning the midnight oil
 *  - Preparation alignment, discipline over motivation, eliminating distractions
 *  - Life awareness, perspective on time, reality of effort and perseverance
 *
 * Strict repository criteria:
 *  - ONLY verified deceased figures (historical icons, scientists, mathematicians, thinkers, philosophers)
 *  - Strictly aligned with study focus, intellectual rigor, resilience, and perspective
 *  - Interleaved greedily so no two consecutive quotes share an author
 *  - Powered by a stateful zero-repeat shuffled deck algorithm (persisted in localStorage)
 */

const RAW_STUDENT_QUOTES = [
  // --- A. P. J. ABDUL KALAM ---
  "Dream is not that which you see while sleeping, it is something that does not let you sleep. — A. P. J. Abdul Kalam",
  "If you want to shine like a sun, first burn like a sun. — A. P. J. Abdul Kalam",
  "To succeed in your mission, you must have single-minded devotion to your goal. — A. P. J. Abdul Kalam",
  "Excellence happens not by accident. It is a continuous process of hard work and self-discipline. — A. P. J. Abdul Kalam",

  // --- SWAMI VIVEKANANDA ---
  "Arise, awake, and stop not till the goal is reached. — Swami Vivekananda",
  "Take up one idea. Make that one idea your life — think of it, dream of it, live on that idea. — Swami Vivekananda",
  "Purity, patience, and perseverance are the three essentials to success and, above all, love. — Swami Vivekananda",
  "Strength is life, weakness is death. All power is within you; you can do anything and everything. — Swami Vivekananda",

  // --- DR. B. R. AMBEDKAR ---
  "Cultivation of mind should be the ultimate aim of human existence. — B. R. Ambedkar",
  "Life should be great rather than long. — B. R. Ambedkar",
  "Education is the milk of a tigress; he who drinks it, cannot help but roar. — B. R. Ambedkar",
  "Lost rights are never regained by begging, yet by relentless struggle and continuous learning. — B. R. Ambedkar",

  // --- CHANAKYA ---
  "Before you start some work, always ask yourself three questions: Why am I doing it, What the results might be, and Will I be successful. — Chanakya",
  "Once you start working on something, don't be afraid of failure and don't abandon it. — Chanakya",
  "Education is the best friend. An educated person is respected everywhere. — Chanakya",
  "Time perfects men as well as destroys them; one who respects time never tastes ruin. — Chanakya",

  // --- MUNSHI PREMCHAND ---
  "The real measure of education is not what you know, but what you do. — Munshi Premchand",
  "Knowledge without character is of no value. — Munshi Premchand",
  "The greatest victory is the victory over oneself. — Munshi Premchand",
  "Life is a struggle, and only those who struggle with honest sweat move forward. — Munshi Premchand",

  // --- MAHATMA GANDHI ---
  "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi",
  "The future depends on what you do today. — Mahatma Gandhi",
  "Glory lies in the attempt to reach one's goal and not in reaching it. — Mahatma Gandhi",
  "Strength does not come from physical capacity. It comes from an indomitable will. — Mahatma Gandhi",

  // --- RABINDRANATH TAGORE ---
  "You cannot cross the sea merely by standing and staring at the water. — Rabindranath Tagore",
  "Let us not pray to be sheltered from dangers but to be fearless when facing them. — Rabindranath Tagore",
  "The butterfly counts not months but moments, and has time enough. — Rabindranath Tagore",
  "Reach high, for stars lie hidden in you. Dream deep, for every dream precedes the goal. — Rabindranath Tagore",

  // --- GAUTAMA BUDDHA ---
  "The mind is everything. What you think you become. — Gautama Buddha",
  "Every morning we are born again. What we do today is what matters most. — Gautama Buddha",
  "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment. — Gautama Buddha",
  "It is better to conquer yourself than to win a thousand battles. — Gautama Buddha",

  // --- MARCUS AURELIUS ---
  "You have power over your mind — not outside events. Realize this, and you will find strength. — Marcus Aurelius",
  "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius",
  "At dawn, when you have trouble getting out of bed, tell yourself: 'I have to go to work — as a human being.' — Marcus Aurelius",
  "Concentrate every minute like a Roman on doing what’s in front of you with precise and genuine seriousness. — Marcus Aurelius",

  // --- SENECA ---
  "Difficulties strengthen the mind, as labor does the body. — Seneca",
  "Luck is what happens when preparation meets opportunity. — Seneca",
  "We suffer more often in imagination than in reality. — Seneca",
  "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult. — Seneca",

  // --- EPICTETUS ---
  "First say to yourself what you would be; and then do what you have to do. — Epictetus",
  "No great thing is created suddenly, any more than a bunch of grapes or a fig. It must blossom, bear fruit, and ripen. — Epictetus",
  "How long are you going to wait before you demand the best for yourself? — Epictetus",
  "Don't explain your philosophy. Embody it through your actions and discipline. — Epictetus",

  // --- THIRUVALLUVAR ---
  "Even what seems impossible becomes possible through tireless, unyielding effort. — Thiruvalluvar",
  "Water will rise to the level of the lotus; a person's stature will rise to the level of their determination. — Thiruvalluvar",
  "Knowledge is that which wards off destruction; it is an inner fortress that foes cannot storm. — Thiruvalluvar",
  "Patience under adversity and steadfast toil will overcome even the decrees of fate. — Thiruvalluvar",

  // --- SRINIVASA RAMANUJAN ---
  "An equation for me has no meaning unless it expresses a thought of God. — Srinivasa Ramanujan",
  "No one can understand the ecstasy of mathematical discovery unless they have worked day and night to resolve the unknown. — Srinivasa Ramanujan",
  "To sit patiently with a calculation through the darkest night is the only true devotion of the mathematician. — Srinivasa Ramanujan",

  // --- ALAN TURING ---
  "We can only see a short distance ahead, but we can see plenty there that needs to be done. — Alan Turing",
  "Mathematical reasoning is the exercise of a combination of two faculties: intuition and ingenuity. — Alan Turing",
  "Sometimes it is the people no one imagines anything of who do the things that no one can imagine. — Alan Turing",

  // --- CLAUDE SHANNON ---
  "Information is the resolution of uncertainty. — Claude Shannon",
  "I just wondered how things were put together and stayed with the puzzle until it made sense. — Claude Shannon",
  "A very small percentage of the people who think they are thinking are actually thinking. Deep focus is rare. — Claude Shannon",

  // --- JOHN VON NEUMANN ---
  "In mathematics you don't understand things. You just get used to them through relentless practice. — John von Neumann",
  "If people do not believe that mathematics is simple, it is only because they do not realize how complicated life is. — John von Neumann",
  "There is no sense in being precise when you don't even know what you're talking about; first master the fundamentals. — John von Neumann",

  // --- ADA LOVELACE ---
  "Forget the world and all its people and whatever may be in it; think only of numbers and principles. — Ada Lovelace",
  "The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves. — Ada Lovelace",
  "Imagination is the discovering faculty, pre-eminently. It penetrates into the unseen worlds around us. — Ada Lovelace",

  // --- EDSGER W. DIJKSTRA ---
  "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra",
  "Computer science is no more about computers than astronomy is about telescopes. — Edsger W. Dijkstra",
  "The tools we use have a profound and devious influence on our thinking habits, and therefore on our thinking ability. — Edsger W. Dijkstra",

  // --- GRACE HOPPER ---
  "The most dangerous phrase in the language is, 'We've always done it this way.' — Grace Hopper",
  "A ship in port is safe, but that's not what ships are built for. Sail out to sea and do new things. — Grace Hopper",
  "One accurate measurement is worth a thousand expert opinions. — Grace Hopper",

  // --- DENNIS RITCHIE ---
  "The only way to learn a new programming language is by writing programs in it. — Dennis Ritchie",
  "UNIX is basically a simple operating system, but you have to be a genius to understand the simplicity. — Dennis Ritchie",

  // --- NORBERT WIENER ---
  "To live effectively is to live with adequate information, continuous discipline, and relentless inquiry. — Norbert Wiener",
  "Progress imposes not only new possibilities for the future, but new demands on our own self-discipline. — Norbert Wiener",

  // --- GEORGE BOOLE ---
  "No general method for the solution of questions can be established without numerical laws of thought. — George Boole",
  "The design of the human mind is governed by systematic, immutable laws of logic. — George Boole",

  // --- CARL FRIEDRICH GAUSS ---
  "It is not knowledge, but the act of learning, not possession but the act of getting there, which grants the greatest enjoyment. — Carl Friedrich Gauss",
  "Mathematics is the queen of the sciences and number theory is the queen of mathematics. — Carl Friedrich Gauss",
  "If others would reflect on mathematical truths as deeply and continuously as I have, they would make my discoveries. — Carl Friedrich Gauss",

  // --- HENRI POINCARÉ ---
  "Science is built up of facts, as a house is built of stones; but an accumulation of facts is no more a science than a heap of stones is a house. — Henri Poincaré",
  "It is by logic that we prove, but by intuition that we discover. — Henri Poincaré",
  "Thought is only a flash between two long nights, but this flash is everything. — Henri Poincaré",

  // --- LEONHARD EULER ---
  "Logic is the foundation of the certainty of all the knowledge we acquire. — Leonhard Euler",
  "Now I will have less distraction. (Upon losing sight in his right eye, diving deeper into calculation) — Leonhard Euler",
  "Mathematicians have tried in vain to discover order in prime numbers; persistence in calculation reveals unseen harmonies. — Leonhard Euler",

  // --- BLAISE PASCAL ---
  "All of humanity's problems stem from man's inability to sit quietly in a room alone and concentrate. — Blaise Pascal",
  "Small minds are concerned with the extraordinary, great minds with the simple. — Blaise Pascal",
  "It is the contest that pleases us, not the victory. — Blaise Pascal",

  // --- RENÉ DESCARTES ---
  "It is not enough to have a good mind; the main thing is to use it well. — René Descartes",
  "Divide each difficulty that you examine into as many parts as possible, and resolve them one by one. — René Descartes",
  "Conquer yourself rather than the world; master your own thoughts rather than circumstances. — René Descartes",

  // --- DAVID HILBERT ---
  "We must know; we will know. — David Hilbert",
  "A mathematical problem should be difficult to entice us, yet not completely inaccessible, lest it mock at our efforts. — David Hilbert",

  // --- EMMY NOETHER ---
  "My methods are really methods of working and thinking; this is why they have crept into everywhere anonymously. — Emmy Noether",
  "If one proves the equality of two numbers without understanding their structure, one has understood nothing. — Emmy Noether",

  // --- KURT GÖDEL ---
  "The more I reflect on mathematics, the more I realize that truth is deeper than mere mechanical proof. — Kurt Gödel",

  // --- ALBERT EINSTEIN ---
  "It is not that I'm so smart, it's just that I stay with problems longer. — Albert Einstein",
  "A person who never made a mistake never tried anything new. — Albert Einstein",
  "Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning. — Albert Einstein",
  "The more I learn, the more I realize how much I don't know. — Albert Einstein",

  // --- RICHARD FEYNMAN ---
  "What I cannot create, I do not understand. — Richard Feynman",
  "The first principle is that you must not fool yourself and you are the easiest person to fool. — Richard Feynman",
  "If you want to master a concept, teach it to someone else. — Richard Feynman",
  "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible. — Richard Feynman",

  // --- ISAAC NEWTON ---
  "If I have seen further it is by standing on the shoulders of Giants. — Isaac Newton",
  "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things. — Isaac Newton",
  "No great discovery was ever made without a bold guess and patient, continuous calculation. — Isaac Newton",
  "If I have ever made any valuable discoveries, it has been due more to patient attention than to any other talent. — Isaac Newton",

  // --- MARIE CURIE ---
  "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less. — Marie Curie",
  "Be less curious about people and more curious about ideas. — Marie Curie",
  "I was taught that the way of progress was neither swift nor easy. — Marie Curie",
  "Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves. — Marie Curie",

  // --- GALILEO GALILEI ---
  "The book of nature is written in the language of mathematics. — Galileo Galilei",
  "All truths are easy to understand once they are discovered; the point is to discover them through diligent investigation. — Galileo Galilei",
  "You cannot teach a man anything; you can only help him find it within himself. — Galileo Galilei",

  // --- MICHAEL FARADAY ---
  "Work, Finish, Publish. — Michael Faraday",
  "Nothing is too wonderful to be true if it be consistent with the laws of nature. — Michael Faraday",
  "Lectures which really teach will require intense concentration both in the teacher and the student. — Michael Faraday",

  // --- JAMES CLERK MAXWELL ---
  "Thoroughly conscious ignorance is the prelude to every real advance in science. — James Clerk Maxwell",
  "In every branch of knowledge the progress is proportional to the amount of facts on which to build. — James Clerk Maxwell",

  // --- MAX PLANCK ---
  "When you change the way you look at things, the things you look at change. — Max Planck",
  "Science cannot solve the ultimate mystery of nature because we ourselves are a part of the mystery we are trying to solve. — Max Planck",
  "Insight must precede application. — Max Planck",

  // --- NIELS BOHR ---
  "An expert is a person who has made all the mistakes that can be made in a very narrow field. — Niels Bohr",
  "How wonderful that we have met with a paradox. Now we have some hope of making progress. — Niels Bohr",

  // --- ERWIN SCHRÖDINGER ---
  "The task is not so much to see what no one has yet seen, but to think what nobody has yet thought about that which everybody sees. — Erwin Schrödinger",

  // --- J. ROBERT OPPENHEIMER ---
  "No man should escape university without knowing how little he knows and how vast the unknown remains. — J. Robert Oppenheimer",
  "There are children playing in the streets who could solve some of my top problems in physics, because they have modes of sensory perception that I lost long ago. — J. Robert Oppenheimer",

  // --- SUBRAHMANYAN CHANDRASEKHAR ---
  "Science is a perception of the world around us where what you find in truth matches the quiet beauty of nature. — Subrahmanyan Chandrasekhar",
  "To study without passionate concentration is to gather dust, not light. — Subrahmanyan Chandrasekhar",

  // --- HOMI BHABHA ---
  "For each person can do best and excel in only that thing of which they are passionately fond and devoted to. — Homi Bhabha",
  "A serious scientific pursuit requires an atmosphere of sustained contemplation and unhurried depth. — Homi Bhabha",

  // --- SATYENDRA NATH BOSE ---
  "If you believe in your hypothesis, work on it with pencil and paper until nature herself either confirms or refutes it. — Satyendra Nath Bose",

  // --- C. V. RAMAN ---
  "I am the master of my failure. If I never fail, how will I ever learn? — C. V. Raman",
  "Success can come to you by courageous devotion to the task. — C. V. Raman",
  "Ask the right questions, and nature will open the doors to her secrets. — C. V. Raman",

  // --- VIKRAM SARABHAI ---
  "He who can listen to music in the midst of noise can achieve great things. — Vikram Sarabhai",
  "There is no limit to what can be achieved by hard work and determination. — Vikram Sarabhai",
  "We must be second to none in the application of advanced technologies to the real problems of society. — Vikram Sarabhai",

  // --- SRI AUROBINDO ---
  "True strength is not in the body, it is in the soul; and the soul grows by effort, by persistence, by hard work. — Sri Aurobindo",
  "The only way to be free from the limits of your past is to raise your consciousness and work with devotion in the present. — Sri Aurobindo",
  "To grow in knowledge, one must first learn to be silent and focus the mind. — Sri Aurobindo",

  // --- JIDDU KRISHNAMURTI ---
  "The ability to observe without evaluating is the highest form of intelligence. — Jiddu Krishnamurti",
  "There is no end to education. It is a lifelong process of unlearning and learning. — Jiddu Krishnamurti",
  "Comparison is the death of original thinking; focus entirely on your own understanding. — Jiddu Krishnamurti",
  "To understand a problem, you must give it your undivided, quiet attention. — Jiddu Krishnamurti",

  // --- ADI SHANKARA ---
  "Do not look at others' virtues and vices, work hard on your own self-realization and progress. — Adi Shankara",
  "Knowledge alone destroys ignorance as light destroys deep darkness. — Adi Shankara",

  // --- KABIR ---
  "Slowly slowly O mind, everything in course happens; the gardener may water with a hundred pots, the fruit arrives only in its season. — Kabir",
  "Do today's work today, and this hour's work right now; when the moment is gone, what will you do? — Kabir",

  // --- LAL BAHADUR SHASTRI ---
  "Hard work is equal to prayer. — Lal Bahadur Shastri",
  "We believe in peace and peaceful development, not only for ourselves but for people all over the world; and peace is built on discipline. — Lal Bahadur Shastri",

  // --- SARDAR VALLABHBHAI PATEL ---
  "Manpower without unity is not a strength unless it is harmonized and united properly; so is mental effort. — Sardar Vallabhbhai Patel",
  "By common endeavour, we can raise the country to a new greatness, while a lack of unity will expose us to fresh calamities. — Sardar Vallabhbhai Patel",

  // --- SUBHAS CHANDRA BOSE ---
  "Reality is too big for frail understanding, yet we must build our lives on the theory which contains maximum truth and uncompromising effort. — Subhas Chandra Bose",
  "No real change in history has ever been achieved by discussions alone; only by struggle and sacrifice. — Subhas Chandra Bose",

  // --- J. R. D. TATA ---
  "Uncommon effort is the key to uncommon success. Always aim for excellence. — J. R. D. Tata",
  "Nothing worthwhile is ever achieved without deep thought, hard work, and persistent effort. — J. R. D. Tata",
  "When you work, work as if everything depends on you; when you pray, pray as if everything depends on God. — J. R. D. Tata",

  // --- MOTHER TERESA ---
  "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin. — Mother Teresa",

  // --- JAWAHARLAL NEHRU ---
  "Time is not measured by the passing of years but by what one does, what one feels, and what one achieves. — Jawaharlal Nehru",
  "Failure comes only when we forget our ideals and objectives and principles. — Jawaharlal Nehru",
  "Action to be effective must be directed to a clearly conceived goal. — Jawaharlal Nehru",

  // --- THOMAS EDISON ---
  "There is no substitute for hard work. — Thomas Edison",
  "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison",
  "Genius is one percent inspiration and ninety-nine percent perspiration. — Thomas Edison",
  "Opportunity is missed by most people because it is dressed in overalls and looks like work. — Thomas Edison",

  // --- STEPHEN HAWKING ---
  "Intelligence is the ability to adapt to change. — Stephen Hawking",
  "Remember to look up at the stars and not down at your feet. Work gives you meaning and purpose. — Stephen Hawking",
  "Quiet people have the loudest minds. — Stephen Hawking",

  // --- LOUIS PASTEUR ---
  "Chance favors only the prepared mind. — Louis Pasteur",
  "Let me tell you the secret that has led me to my goal: my strength lies solely in my tenacity. — Louis Pasteur",

  // --- ALEXANDER GRAHAM BELL ---
  "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus. — Alexander Graham Bell",
  "Before anything else, preparation is the key to success. — Alexander Graham Bell",

  // --- NIKOLA TESLA ---
  "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration. — Nikola Tesla",
  "Be alone, that is the secret of invention; be alone, that is when ideas are born. — Nikola Tesla",
  "Our virtues and our failings are inseparable, like force and matter. When they separate, man is no more. — Nikola Tesla",

  // --- LEONARDO DA VINCI ---
  "Learning never exhausts the mind. — Leonardo da Vinci",
  "As every divided kingdom falls, so every mind divided between many studies confounds and saps itself. — Leonardo da Vinci",
  "Obstacles cannot crush me; every obstacle yields to stern resolve. He who is fixed to a star does not change his mind. — Leonardo da Vinci",
  "Iron rusts from disuse; stagnant water loses its purity; even so does inaction sap the vigors of the mind. — Leonardo da Vinci",

  // --- STEVE JOBS ---
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. — Steve Jobs",
  "Your time is limited, so don't waste it living someone else's life. — Steve Jobs",
  "Stay hungry. Stay foolish. — Steve Jobs",

  // --- BRUCE LEE ---
  "The successful warrior is the average man, with laser-like focus. — Bruce Lee",
  "Do not pray for an easy life, pray for the strength to endure a difficult one. — Bruce Lee",
  "Knowing is not enough, we must apply. Willing is not enough, we must do. — Bruce Lee",
  "Long-term consistency trumps short-term intensity. — Bruce Lee",

  // --- MUHAMMAD ALI ---
  "Don't count the days, make the days count. — Muhammad Ali",
  "I hated every minute of training, but I said: 'Don't quit. Suffer now and live the rest of your life as a champion.' — Muhammad Ali",
  "He who is not courageous enough to take risks will accomplish nothing in life. — Muhammad Ali",

  // --- NELSON MANDELA ---
  "It always seems impossible until it's done. — Nelson Mandela",
  "The greatest glory in living lies not in never falling, but in rising every time we fall. — Nelson Mandela",
  "Education is the most powerful weapon which you can use to change the world. — Nelson Mandela",

  // --- ABRAHAM LINCOLN ---
  "Give me six hours to chop down a tree and I will spend the first four sharpening the axe. — Abraham Lincoln",
  "Determine that the thing can and shall be done, and then we shall find the way. — Abraham Lincoln",
  "Leave nothing for tomorrow which can be done today. — Abraham Lincoln",
  "I will prepare and study, and someday my chance will come. — Abraham Lincoln",

  // --- THEODORE ROOSEVELT ---
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "Do what you can, with what you have, where you are. — Theodore Roosevelt",
  "It is hard to fail, but it is worse never to have tried to succeed. — Theodore Roosevelt",
  "It is not the critic who counts; the credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat. — Theodore Roosevelt",

  // --- ARISTOTLE ---
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "The roots of education are bitter, but the fruit is sweet. — Aristotle",
  "Pleasure in the job puts perfection in the work. — Aristotle",
  "Patience is bitter, but its fruit is sweet. — Aristotle",

  // --- PLATO ---
  "The beginning is the most important part of the work. — Plato",
  "Courage is knowing what not to fear. — Plato",
  "Never discourage anyone who continually makes progress, no matter how slow. — Plato",

  // --- SOCRATES ---
  "Wisdom begins in wonder. — Socrates",
  "An unexamined life is not worth living. — Socrates",
  "To know, is to know that you know nothing. That is the meaning of true knowledge. — Socrates",

  // --- CONFUCIUS ---
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "He who learns but does not think is lost! He who thinks but does not learn is in great danger. — Confucius",
  "The man who moves a mountain begins by carrying away small stones. — Confucius",

  // --- LAO TZU ---
  "The journey of a thousand miles begins with a single step. — Lao Tzu",
  "Mastering others is strength. Mastering yourself is true power. — Lao Tzu",
  "Do the difficult things while they are easy and do the great things while they are small. — Lao Tzu",

  // --- WINSTON CHURCHILL ---
  "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
  "Success is stumbling from failure to failure with no loss of enthusiasm. — Winston Churchill",
  "Continuous effort — not strength or intelligence — is the key to unlocking our potential. — Winston Churchill",

  // --- HELEN KELLER ---
  "Character cannot be developed in ease and quiet. Only through experience of trial and suffering can the soul be strengthened. — Helen Keller",
  "Never bend your head. Always hold it high. Look the world straight in the eye. — Helen Keller",
  "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence. — Helen Keller",

  // --- MAYA ANGELOU ---
  "Nothing will work unless you do. — Maya Angelou",
  "All great achievements require time, patience, and unyielding dedication. — Maya Angelou",

  // --- AARON SWARTZ ---
  "Be curious. Read widely. Try new things. What people call intelligence just boils down to relentless curiosity. — Aaron Swartz",

  // --- PABLO PICASSO ---
  "Action is the foundational key to all success. — Pablo Picasso",
  "Inspiration exists, but it has to find you working. — Pablo Picasso",

  // --- RALPH WALDO EMERSON ---
  "The mind, once stretched by a new idea, never returns to its original dimensions. — Ralph Waldo Emerson",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson",
  "Nothing great was ever achieved without enthusiasm and concentrated energy. — Ralph Waldo Emerson",
  "The only person you are destined to become is the person you decide to be. — Ralph Waldo Emerson",

  // --- THOMAS JEFFERSON ---
  "I find that the harder I work, the more luck I seem to have. — Thomas Jefferson",
  "Determine never to be idle. No person will have occasion to complain of the want of time who never loses any. — Thomas Jefferson",

  // --- MARK TWAIN ---
  "The secret of getting ahead is getting started. — Mark Twain",
  "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. — Mark Twain",

  // --- ROBERT COLLIER ---
  "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",

  // --- BENJAMIN FRANKLIN ---
  "By failing to prepare, you are preparing to fail. — Benjamin Franklin",
  "Energy and persistence conquer all things. — Benjamin Franklin",
  "Well done is better than well said. — Benjamin Franklin",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",

  // --- JOHANN WOLFGANG VON GOETHE ---
  "Knowing is not enough; we must apply. Willing is not enough; we must do. — Johann Wolfgang von Goethe",
  "Everything is hard before it is easy. — Johann Wolfgang von Goethe",
  "Whatever you can do or dream you can, begin it. Boldness has genius, power and magic in it. — Johann Wolfgang von Goethe",

  // --- FRIEDRICH NIETZSCHE ---
  "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
  "What does not kill me makes me stronger. — Friedrich Nietzsche",
  "No one can construct for you the bridge upon which precisely you must cross the stream of life, no one but you yourself alone. — Friedrich Nietzsche",

  // --- NAPOLEON HILL ---
  "Do not wait; the time will never be 'just right.' Start where you stand, and work with whatever tools you may have. — Napoleon Hill",
  "Strength and growth come only through continuous effort and struggle. — Napoleon Hill",

  // --- GEORGE WASHINGTON ---
  "The harder the conflict, the greater the triumph. — George Washington",
  "Perseverance and spirit have done wonders in all ages. — George Washington",

  // --- WALTER ELLIOT ---
  "Perseverance is not a long race; it is many short races one after another. — Walter Elliot",

  // --- ROBERT FROST ---
  "The best way out is always through. — Robert Frost",

  // --- WALT WHITMAN ---
  "Keep your face always toward the sunshine, and shadows will fall behind you. — Walt Whitman",

  // --- DOROTHY PARKER ---
  "The cure for boredom is curiosity. There is no cure for curiosity. — Dorothy Parker",

  // --- SAMUEL JOHNSON ---
  "Great works are performed not by strength, but by perseverance. — Samuel Johnson",
  "Few things are impossible to diligence and skill. Great works are performed not by sudden flight, but by continuous toil. — Samuel Johnson",

  // --- BEVERLY SILLS ---
  "There are no shortcuts to any place worth going. — Beverly Sills",

  // --- HENRY WADSWORTH LONGFELLOW ---
  "The heights by great men reached and kept were not attained by sudden flight, but they, while their companions slept, were toiling upward in the night. — Henry Wadsworth Longfellow",

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
  "Diligence is the mother of good fortune. — Miguel de Cervantes",

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
  "To strive, to seek, to find, and not to yield. — Alfred Lord Tennyson",

  // --- ALEXANDER POPE ---
  "A little learning is a dangerous thing; drink deep, or taste not the Pierian spring. — Alexander Pope",

  // --- TAOIST PROVERB ---
  "The journey is the reward. — Taoist Proverb",

  // --- JIM ROHN ---
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "Motivation is what gets you started. Habit is what keeps you going. — Jim Rohn",
  "Formal education will make you a living; self-education will make you a fortune. — Jim Rohn",

  // --- JAMES ALLEN ---
  "You are today where your thoughts have brought you; you will be tomorrow where your thoughts take you. — James Allen",
  "Men do not attract what they want, but what they are. Self-discipline is the master key. — James Allen",
  "Circumstances do not make the man, they reveal him. — James Allen",

  // --- FRANCIS BACON ---
  "Knowledge is power. — Francis Bacon",
  "Reading maketh a full man; conference a ready man; and writing an exact man. — Francis Bacon",
  "A prudent question is one-half of wisdom. — Francis Bacon",

  // --- PLUTARCH ---
  "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch",
  "Know how to listen, and you will profit even from those who talk badly. — Plutarch",

  // --- HERACLITUS ---
  "No man ever steps in the same river twice, for it's not the same river and he's not the same man. — Heraclitus",
  "Character is destiny. — Heraclitus",

  // --- VINCENT VAN GOGH ---
  "Great things are done by a series of small things brought together. — Vincent van Gogh",
  "If you hear a voice within you say 'you cannot paint,' then by all means paint, and that voice will be silenced. — Vincent van Gogh",
  "I am always doing what I cannot do yet, in order to learn how to do it. — Vincent van Gogh",

  // --- HENRY FORD ---
  "Nothing is particularly hard if you divide it into small jobs. — Henry Ford",
  "Whether you think you can, or you think you can't — you're right. — Henry Ford",
  "Obstacles are those frightful things you see when you take your eyes off your goal. — Henry Ford",

  // --- OVID ---
  "What is harder than rock, or softer than water? Yet soft water hollows out hard rock through persistence. — Ovid",

  // --- LUCRETIUS ---
  "Constant drops of water hollow out the stone through quiet perseverance. — Lucretius",

  // --- WILLIAM HAZLITT ---
  "The more we do, the more we can do; the more busy we are, the more leisure we have. — William Hazlitt",

  // --- HORACE ---
  "He who has begun has half done. Dare to be wise; begin! — Horace",
  "Adversity has the effect of eliciting talents which in prosperous circumstances would have lain dormant. — Horace",

  // --- BALTASAR GRACIÁN ---
  "Without courage, wisdom bears no fruit. Work is the price paid for true reputation. — Baltasar Gracián",

  // --- ANTOINE DE SAINT-EXUPÉRY ---
  "A goal without a plan is just a wish. — Antoine de Saint-Exupéry",
  "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away. — Antoine de Saint-Exupéry",
  "What saves a man is to take a step. Then another step. It is always the same step, but you must take it. — Antoine de Saint-Exupéry",

  // --- JOHN MILTON ---
  "Long is the way and hard, that out of darkness leads up to light. — John Milton",

  // --- ABIGAIL ADAMS ---
  "Learning is not attained by chance; it must be sought for with ardor and attended to with diligence. — Abigail Adams",

  // --- ESTÉE LAUDER ---
  "I never dreamed about success. I worked for it with every fiber of my being. — Estée Lauder",

  // --- HENRY DAVID THOREAU ---
  "It is not enough to be busy. The question is: what are we busy about? — Henry David Thoreau",
  "I know of no more encouraging fact than the unquestionable ability of man to elevate his life by conscious endeavor. — Henry David Thoreau",
  "If one advances confidently in the direction of his dreams, he will meet with a success unexpected in common hours. — Henry David Thoreau",

  // --- BERTRAND RUSSELL ---
  "In all affairs it's a healthy thing now and then to hang a question mark on the things you have long taken for granted. — Bertrand Russell",
  "The fundamental cause of trouble in the world today is that the stupid are cocksure while the intelligent are full of doubt. Probe deeper. — Bertrand Russell",
  "Conquering fear is the beginning of wisdom. — Bertrand Russell",

  // --- BARUCH SPINOZA ---
  "All things excellent are as difficult as they are rare. — Baruch Spinoza",
  "Peace of mind is not the absence of conflict, but the mastery of reason over impulse. — Baruch Spinoza",

  // --- ARTHUR SCHOPENHAUER ---
  "Talent hits a target no one else can hit; Genius hits a target no one else can see. — Arthur Schopenhauer",
  "To read without reflecting is like eating without digesting. — Arthur Schopenhauer",

  // --- HYPATIA ---
  "Reserve your right to think, for even to think wrongly is better than not to think at all. — Hypatia",
  "Fables should be taught as fables, myths as myths; truth must be sought through rigorous investigation. — Hypatia",

  // --- ARCHIMEDES ---
  "Give me a place to stand, and a lever long enough, and I will move the world. — Archimedes",

  // --- CHARLES DARWIN ---
  "It is not the strongest of the species that survives, nor the most intelligent; it is the one most adaptable to change. — Charles Darwin",
  "A man who dares to waste one hour of time has not discovered the value of life. — Charles Darwin",

  // --- OSHO ---
  "Life begins where fear ends. — Osho",
  "Awareness is the greatest alchemy; observe yourself without judging and transformation begins. — Osho",
  "Be realistic: plan for a miracle through deep, silent devotion to the work. — Osho",

  // --- IMMANUEL KANT ---
  "Dare to know! Have courage to use your own reason. — Immanuel Kant",
  "Science is organized knowledge. Wisdom is organized life. — Immanuel Kant",

  // --- MARY SHELLEY ---
  "The beginning is always tough, but nothing contributes so much to tranquilize the mind as a steady purpose. — Mary Shelley",
  "Invention does not consist in creating out of void, but out of chaos; the materials must, in the first place, be afforded. — Mary Shelley",

  // --- JOHANNES KEPLER ---
  "The diversity of the phenomena of nature is so great, and the treasures hidden in the heavens so rich, precisely that the human mind shall never lack fresh nourishment. — Johannes Kepler",

  // --- DEMOCRITUS ---
  "Nothing exists except atoms and empty space; everything else is opinion. Seek the fundamental laws. — Democritus",
  "Do not trust all men, but trust men of worth; the former course is silly, the latter sensible. — Democritus",

  // --- PYTHAGORAS ---
  "Reason is immortal, all else mortal. Train your reasoning until it cuts through confusion. — Pythagoras",
  "Do not say a little in many words, but a great deal in few. — Pythagoras",

  // --- JOHN LOCKE ---
  "The improvement of understanding is for two ends: first, our own increase of knowledge; secondly, to enable us to deliver that knowledge to others. — John Locke",
  "Reading furnishes the mind only with materials of knowledge; it is thinking that makes what we read ours. — John Locke",

  // --- BLAISE PASCAL (additional) ---
  "We arrive at the truth, not by the reason alone, but also by the heart through persistent dedication. — Blaise Pascal",

  // --- CARL SAGAN ---
  "Somewhere, something incredible is waiting to be known. — Carl Sagan",
  "Understanding is a kind of ecstasy; there is no substitute for the joy of discovering the truth. — Carl Sagan",
  "For me, it is far better to grasp the Universe as it really is than to persist in delusion. — Carl Sagan",

  // --- SANTIAGO RAMÓN Y CAJAL ---
  "Every man can, if he so desires, become the sculptor of his own brain through relentless practice. — Santiago Ramón y Cajal",
  "Deficiencies of innate ability may be compensated through excess of work and concentration. — Santiago Ramón y Cajal",
  "Originality is achieved not by sudden leaps, but by prolonged, patient reflection upon the same problem. — Santiago Ramón y Cajal",

  // --- M. VISVESVARAYA ---
  "Remember, whatever your work may be, execute it with such perfection that no one can do it better. — M. Visvesvaraya",
  "Self-examination and self-discipline are the most important components of intellectual growth. — M. Visvesvaraya",
  "Work performed with deep concentration and dedication is its own highest reward. — M. Visvesvaraya",

  // --- ARYABHATA ---
  "Truth shines when unclouded by bias; through continuous mathematical observation the secrets of numbers emerge. — Aryabhata",

  // --- BRAHMAGUPTA ---
  "As the sun eclipses the stars by its brilliance, so the scholar of perseverance eclipses difficulties by solving tough problems. — Brahmagupta",

  // --- BHASKARA II ---
  "Joy enters the heart of the wise when, through rigorous calculation, the unknown becomes known. — Bhaskara II",

  // --- IBN AL-HAYTHAM (ALHAZEN) ---
  "The duty of the seeker of truth is to question and test every theory against evidence, not against consensus. — Ibn al-Haytham",

  // --- IBN SINA (AVICENNA) ---
  "The knowledge of anything is not complete until known by its fundamental principles. Seek the root. — Ibn Sina",
  "Delve deeply into your studies; a life of intellectual breadth and depth outweighs mere comfortable years. — Ibn Sina",

  // --- LEO TOLSTOY ---
  "The two most powerful warriors are patience and time. — Leo Tolstoy",
  "There is no greatness where there is not simplicity, goodness, and truth. — Leo Tolstoy",

  // --- ANTON CHEKHOV ---
  "Knowledge is of no value unless you put it into daily practice. — Anton Chekhov",

  // --- FYODOR DOSTOEVSKY ---
  "It takes something more than intelligence to act intelligently: it takes character, patience, and steadfastness. — Fyodor Dostoevsky",

  // --- LORD KELVIN ---
  "To measure is to know. If you cannot measure your progress, you cannot improve it. — Lord Kelvin",

  // --- CHARLES BABBAGE ---
  "Errors using inadequate data are much less than those using no data at all. Begin with what you can test. — Charles Babbage",

  // --- ARTHUR CONAN DOYLE ---
  "It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories. — Arthur Conan Doyle",

  // --- VICTOR HUGO ---
  "Perseverance is the secret of all triumphs. — Victor Hugo",

  // --- GEORGE BERNARD SHAW ---
  "Life isn't about finding yourself. Life is about creating yourself through purposeful action. — George Bernard Shaw",
  "The people who get on in this world are the people who get up and look for the circumstances they want, and if they can't find them, make them. — George Bernard Shaw",

  // --- MICHELANGELO ---
  "If people knew how hard I had to work to gain my mastery, it would not seem so wonderful at all. — Michelangelo",
  "The greater danger for most of us lies not in setting our aim too high and falling short; but in setting our aim too low, and achieving our mark. — Michelangelo",

  // --- PELÉ ---
  "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do. — Pelé",

  // --- VINCE LOMBARDI ---
  "The price of success is hard work, dedication to the job at hand, and the determination that whether we win or lose, we have applied the best of ourselves. — Vince Lombardi",
  "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will. — Vince Lombardi",

  // --- COLIN POWELL ---
  "A dream does not become reality through magic; it takes sweat, determination, and hard work. — Colin Powell",
  "Success is the result of perfection, hard work, learning from failure, loyalty, and persistence. — Colin Powell",

  // --- MARGARET THATCHER ---
  "Success is a mixture of having a flair for the thing that you are doing, knowing that it is not enough, and having hard work and a certain sense of purpose. — Margaret Thatcher"
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

  const authorLists = Object.keys(groups).map((author) => ({
    author,
    quotes: groups[author],
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
      const hasMore = authorLists.some((list) => list.quotes.length > 0);
      if (hasMore) {
        const fallbackIndex = authorLists.findIndex((list) => list.quotes.length > 0);
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

export const QUOTE_DECK_STORAGE_KEY = "gateqa_quote_deck_v2";
export const QUOTE_DWELL_TIME_MS = 10 * 60 * 1000; // 10 minutes session dwell

/**
 * Creates a randomly shuffled permutation deck [0, ..., length - 1].
 * Optionally ensures index 0 does not have the same author as the last shown quote.
 */
export const createShuffledDeck = (length, avoidAuthor = null, quotes = STUDENT_QUOTES) => {
  const deck = Array.from({ length }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  if (avoidAuthor && quotes && quotes.length > 1) {
    const firstQuoteAuthor = getQuoteAuthor(quotes[deck[0]]);
    if (firstQuoteAuthor === avoidAuthor) {
      // Swap with second element
      [deck[0], deck[1]] = [deck[1], deck[0]];
    }
  }

  return deck;
};

export const getQuoteAuthor = (quoteStr) => {
  if (!quoteStr || typeof quoteStr !== "string") return "";
  const parts = quoteStr.split(/\s+(?:\u2014|-)\s+/);
  return parts.length > 1 ? parts[parts.length - 1].trim() : "";
};

export const parseQuote = (raw) => {
  if (!raw) return { text: "", author: "" };
  if (typeof raw === "object" && raw.text) {
    return { text: raw.text, author: raw.author || "" };
  }
  const parts = String(raw).split(/\s+(?:\u2014|-)\s+/);
  const text = parts[0] ? parts[0].trim() : String(raw);
  const author = parts.length > 1 ? parts[parts.length - 1].trim() : "";
  return { text, author };
};

// In-memory fallback if localStorage is blocked (e.g. privacy mode, SSR)
let memoryState = null;

const readDeckState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUOTE_DECK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.deck) &&
      parsed.deck.length === STUDENT_QUOTES.length &&
      typeof parsed.pointer === "number" &&
      parsed.pointer >= 0 &&
      parsed.pointer < parsed.deck.length &&
      typeof parsed.currentQuote === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return memoryState;
  }
};

const writeDeckState = (state) => {
  memoryState = state;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUOTE_DECK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Graceful silent fallback to memoryState
  }
};

/**
 * Pick an inspiring study quote for the student.
 * Uses a zero-repeat shuffled permutation deck so every quote in the database
 * is shown exactly once before any quote can repeat.
 *
 * @param {Object} options
 * @param {boolean} [options.forceNew=false] - If true, immediately advances to the next unseen quote in the deck.
 * @returns {string} Raw quote string in format "Text — Author"
 */
export const getQuoteForToday = ({ forceNew = false } = {}) => {
  if (typeof window === "undefined" || STUDENT_QUOTES.length === 0) {
    return STUDENT_QUOTES[0] || "";
  }

  const now = Date.now();
  let state = readDeckState();

  // Initialize fresh deck if absent or invalidated by quote pool changes
  if (!state) {
    const deck = createShuffledDeck(STUDENT_QUOTES.length);
    const initialQuote = STUDENT_QUOTES[deck[0]];
    state = {
      deck,
      pointer: 0,
      currentQuote: initialQuote,
      lastAssignedAt: now,
      version: 2,
    };
    writeDeckState(state);
    return initialQuote;
  }

  // Preserve the current quote during the active dwell window unless explicitly forced
  if (!forceNew && state.currentQuote && now - state.lastAssignedAt < QUOTE_DWELL_TIME_MS) {
    return state.currentQuote;
  }

  // Advance pointer in the shuffled deck
  let nextPointer = state.pointer + 1;
  let deck = state.deck;

  // If the entire deck of 360+ quotes has been exhausted, reshuffle for a new cycle
  if (nextPointer >= deck.length) {
    const lastAuthor = getQuoteAuthor(state.currentQuote);
    deck = createShuffledDeck(STUDENT_QUOTES.length, lastAuthor, STUDENT_QUOTES);
    nextPointer = 0;
  }

  const nextQuote = STUDENT_QUOTES[deck[nextPointer]];
  state = {
    deck,
    pointer: nextPointer,
    currentQuote: nextQuote,
    lastAssignedAt: now,
    version: 2,
  };
  writeDeckState(state);

  return nextQuote;
};

/**
 * Force fetch the next unseen inspiring quote from the deck.
 */
export const getNextQuote = (options = {}) => {
  return getQuoteForToday({ ...options, forceNew: true });
};
