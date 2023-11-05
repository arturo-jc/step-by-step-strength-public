import { Intensity } from "../../generated/graphql.generated";
import { INTENSITY_MAP } from "../global";

export function getNextIntensity(intensity: Intensity, cycle: boolean) {

  const intensities = Object.keys(INTENSITY_MAP);

  const index = intensities.indexOf(intensity);

  if (index === -1) {
    throw new Error(`Invalid intensity: ${intensity}`);
  };

  if (cycle) {
    return intensities[(index + 1) % intensities.length] as Intensity;
  } else {
    return intensities[index + 1] ? intensities[index + 1] as Intensity : intensity;
  }

}
