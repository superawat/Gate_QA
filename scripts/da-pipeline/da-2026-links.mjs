const DA_2026_GA_ID_START = 523225;
const DA_2026_CS_ID_START = 523214;

/**
 * GateOverflow's current canonical question links for the 2026 DA paper.
 *
 * The paper was posted in two blocks: Q1-Q10 are General Aptitude and
 * Q11-Q65 are the technical section. The site's technical sequence has one
 * unrelated question ID gap before technical Q41 (paper Q51), so the offset
 * is kept explicit here instead of deriving IDs from the year/set label at
 * runtime.
 */
export function getDa2026GateOverflowLink(questionNumber) {
  const number = Number(questionNumber);
  if (!Number.isInteger(number) || number < 1 || number > 65) {
    return "";
  }

  if (number <= 10) {
    return `https://gateoverflow.in/${DA_2026_GA_ID_START - number + 1}/gate-da-2026-ga-question-${number}`;
  }

  const technicalNumber = number - 10;
  const id = DA_2026_CS_ID_START - technicalNumber + 1 - (technicalNumber >= 41 ? 1 : 0);
  return `https://gateoverflow.in/${id}/gate-da-2026-question-${technicalNumber}`;
}

export default getDa2026GateOverflowLink;
