const fs = require('fs');

const missingQuestions = [
  {
    title: 'GATE CSE 1987 | Question: 15',
    year: 1987,
    link: 'https://gateoverflow.in/82656/gate1987-15a',
    question: '<p>Fig. below shows the circuit diagram of a wien bridge oscillator using an op-amp.</p>\n<p><img alt=\"\" src=\"/Gate_QA/question-images/82656.jpg\"></p>\n<p>The frequency of oscillation is given by $f= 1/(2 \\pi RC)$. To have the system oscillate the ratio $R_{2}/R_{1}$ should be</p>\n<ol style=\"list-style-type:upper-alpha\">\n<li>0.5</li>\n<li>29</li>\n<li>2</li>\n<li>Any value</li>\n</ol>',
    tags: [
      'gate1987',
      'digital-logic',
      'analog-circuits',
      'out-of-syllabus-now'
    ],
    question_uid: 'go:82656',
    exam_uid: 'cse:1987:set1:main:q15',
    answer_meta: {
      type: 'MCQ',
      answer: 'D',
      tolerance: null,
      source: 'manual_resolution'
    },
    paper_scope: 'official_cse',
    source_branch: 'CSE',
    cse_set: null,
    source_session: null
  },
  {
    title: 'GATE CSE 1987 | Question: 1-IX',
    year: 1987,
    link: 'https://gateoverflow.in/80278/gate1987-1-ix',
    question: '<p>The refreshing rate of dynamic RAMs is in the range of:</p>\n<ol style=\"list-style-type:upper-alpha\">\n<li>2 microseconds</li>\n<li>2 milliseconds.</li>\n<li>50 milli seconds</li>\n<li>500 milliseconds</li>\n</ol>',
    tags: [
      'gate1987',
      'co-and-architecture',
      'memory-organization',
      'normal'
    ],
    question_uid: 'go:80278',
    exam_uid: 'cse:1987:set1:main:q1-ix',
    answer_meta: {
      type: 'MCQ',
      answer: 'B',
      tolerance: null,
      source: 'manual_resolution'
    },
    paper_scope: 'official_cse',
    source_branch: 'CSE',
    cse_set: null,
    source_session: null
  },
  {
    title: 'GATE CSE 1987 | Question: 1-X',
    year: 1987,
    link: 'https://gateoverflow.in/80281/gate1987-1-x',
    question: '<p>The data transfer rate of a double-density floppy disk system is about:</p>\n<ol style=\"list-style-type:upper-alpha\">\n<li>5K bits/sec</li>\n<li>50K bits/sec</li>\n<li>500K bits/sec</li>\n<li>5000K bits/sec</li>\n</ol>',
    tags: [
      'gate1987',
      'co-and-architecture',
      'secondary-storage',
      'out-of-syllabus-now'
    ],
    question_uid: 'go:80281',
    exam_uid: 'cse:1987:set1:main:q1-x',
    answer_meta: {
      type: 'MCQ',
      answer: 'C',
      tolerance: null,
      source: 'manual_resolution'
    },
    paper_scope: 'official_cse',
    source_branch: 'CSE',
    cse_set: null,
    source_session: null
  }
];

fs.writeFileSync('scratch/built_missing_1988_1987.json', JSON.stringify(missingQuestions, null, 2));
console.log('Successfully written 3 missing questions to scratch/built_missing_1988_1987.json');
