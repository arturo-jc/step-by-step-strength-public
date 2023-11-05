import { Metric } from "../shared/types";

export class IncrementsMap {
  private map: Map<string, Map<Metric, number>>;

  constructor() {
    this.map = new Map();
  }

  setIncrement(exerciseItemKey: string, metric: Metric, increment: number): void {
    let innerMap = this.map.get(exerciseItemKey);
    if (!innerMap) {
      innerMap = new Map<Metric, number>();
      this.map.set(exerciseItemKey, innerMap);
    }
    innerMap.set(metric, increment);
  }

  getIncrement(exerciseItemKey: string, metric: Metric): number | undefined {
    const innerMap = this.map.get(exerciseItemKey);
    return innerMap && innerMap.get(metric);
  }

  hasIncrement(exerciseItemKey: string, metric: Metric): boolean {
    const innerMap = this.map.get(exerciseItemKey);
    return !!innerMap && innerMap.has(metric);
  }

  addToIncrement(exerciseItemKey: string, metric: Metric, increment: number): void {
    const current = this.getIncrement(exerciseItemKey, metric);
    const newIncrement = current ? current + increment : increment;
    this.setIncrement(exerciseItemKey, metric, newIncrement);
  }

}
