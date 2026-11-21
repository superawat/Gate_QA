import fs from "node:fs";

export function getCleanQuestions(startIdx, endIdx) {
  const shard = JSON.parse(fs.readFileSync("public/data/aptitude/english/spot-the-error.json", "utf8"));
  const slice = shard.slice(startIdx, endIdx);
  
  return slice.map((q, idx) => {
    const rawStem = q.questionHtml
      .replace(/<ol[\s\S]*?<\/ol>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    const cleanOptions = q.options.map(opt => 
      opt.replace(/<[^>]+>/g, "").replace(/\\n/g, "").trim()
    );
    
    const ansLetter = q.answer;
    const ansIdx = ansLetter.charCodeAt(0) - 65;
    const chosenOption = cleanOptions[ansIdx] || "";
    
    return {
      index: startIdx + idx,
      uid: q.uid,
      stem: rawStem,
      options: cleanOptions,
      answer: ansLetter,
      chosenOption
    };
  });
}

if (process.argv[1] && process.argv[1].endsWith("inspect-chunk.mjs")) {
  const start = parseInt(process.argv[2] || "50", 10);
  const count = parseInt(process.argv[3] || "10", 10);
  const mode = process.argv[4] || "compact";
  const list = getCleanQuestions(start, start + count);
  if (mode === "compact") {
    list.forEach(q => {
      console.log(`[${q.uid}] Ans: ${q.answer} | Chosen: "${q.chosenOption}" | Stem: ${q.stem}`);
    });
  } else {
    console.log(JSON.stringify(list, null, 2));
  }
}
