export type RoutineBlockType = 'exercise' | 'rest';

export type RoutineBlock = {
  id: string;
  routineId: string;
  name: string;
  type: RoutineBlockType;
  durationSec: number;
  order: number;
  groupId?: string;
};

export type RoutineGroup = {
  id: string;
  routineId: string;
  label: string;
  repetitions: number;
};

export type Routine = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  totalDurationSec: number;
  blocks: RoutineBlock[];
  groups: RoutineGroup[];
  note?: string;
};

export type RoutineSummary = Pick<Routine, 'id' | 'name' | 'totalDurationSec' | 'updatedAt'>;
