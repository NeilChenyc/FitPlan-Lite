export interface Exercise {
  id: number;
  name: string;
}

export interface Day {
  id: number;
  plan_id: number;
  date: string;
  title: string | null;
  is_rest: boolean;
  completed: boolean;
  exercises: Exercise[];
}

export interface Plan {
  id: number;
  week_start: string;
  days: Day[];
}

export interface Stats {
  weekly_completion: number;
  completed_training_days: number;
  total_training_days: number;
  total_exercises: number;
  completed_exercises: number;
}

export interface TemplatePreview {
  weekly_completion: number;
  training_days_count: number;
  next_week_start: string;
  days: Day[];
}

export interface ApplyTemplateResponse {
  message: string;
  plan_id: number;
}

export interface DayCreate {
  date: string;
  title: string | null;
  is_rest: boolean;
  completed: boolean;
  exercises: ExerciseCreate[];
}

export interface ExerciseCreate {
  name: string;
}

export interface PlanCreate {
  week_start: string;
  days: DayCreate[];
}

export interface DayUpdate {
  title?: string | null;
  is_rest?: boolean;
  completed?: boolean;
  exercises?: ExerciseCreate[];
}
