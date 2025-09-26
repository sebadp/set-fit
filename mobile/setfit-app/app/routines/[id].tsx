import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { RoutineEditor } from '@/components/builder/RoutineEditor';
import { selectSelectedRoutine, useRoutineStore } from '@/stores/routineStore';

export default function EditRoutineScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const routine = useRoutineStore((state) => (id ? state.routines.find((item) => item.id === id) ?? null : null));

  if (!id || !routine) {
    return <RoutineEditor mode="create" />;
  }

  return <RoutineEditor mode="edit" initialRoutine={routine} />;
}
