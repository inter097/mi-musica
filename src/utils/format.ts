export function formatDuration(totalSeconds?: number): string {
  if (totalSeconds === undefined || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    return '--:--';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
