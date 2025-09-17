
export interface Food {
  id?: string;
  name: string;

  servings: number[];
  units: string[];

  // per 1 g
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  calcium: number;
  potassium: number;
  iron: number;
}
