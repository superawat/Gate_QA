export const resolveHorizontalSwipeNavigation = ({
  startX,
  startY,
  endX,
  endY,
  minDistance = 72,
  maxVerticalDrift = 64,
} = {}) => {
  const points = [startX, startY, endX, endY].map((value) => Number(value));
  if (points.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < minDistance || absY > maxVerticalDrift || absX <= absY) {
    return null;
  }

  return deltaX < 0 ? "next" : "previous";
};
