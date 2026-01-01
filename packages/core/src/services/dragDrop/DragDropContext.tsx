/**
 * DragDropContext - Provider for global drag-drop state
 *
 * Manages drag state across the application using React context.
 * Stores drag data in both DataTransfer (for native DnD) and context (for rich data).
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  DragDropContextValue,
  DragData,
  DropResult,
  DropTarget,
  DragState,
  DragType,
} from './types';

/** Action types for the drag-drop reducer */
type DragDropAction =
  | { type: 'START_DRAG'; payload: DragData }
  | { type: 'END_DRAG'; payload?: DropResult }
  | { type: 'REGISTER_TARGET'; payload: DropTarget }
  | { type: 'UNREGISTER_TARGET'; payload: string };

/** Initial state */
const initialState: DragState = {
  isDragging: false,
  dragData: null,
  dropTargets: new Map(),
  lastDropResult: null,
};

/** Reducer for drag-drop state */
function dragDropReducer(state: DragState, action: DragDropAction): DragState {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        dragData: action.payload,
        lastDropResult: null,
      };

    case 'END_DRAG':
      return {
        ...state,
        isDragging: false,
        dragData: null,
        lastDropResult: action.payload ?? null,
      };

    case 'REGISTER_TARGET': {
      const newTargets = new Map(state.dropTargets);
      newTargets.set(action.payload.id, action.payload);
      return {
        ...state,
        dropTargets: newTargets,
      };
    }

    case 'UNREGISTER_TARGET': {
      const newTargets = new Map(state.dropTargets);
      newTargets.delete(action.payload);
      return {
        ...state,
        dropTargets: newTargets,
      };
    }

    default:
      return state;
  }
}

/** Context for drag-drop state */
const DragDropContext = createContext<DragDropContextValue | undefined>(undefined);

/** Props for DragDropProvider */
export interface DragDropProviderProps {
  children: ReactNode;
}

/**
 * DragDropProvider - Provides drag-drop state to the component tree
 */
export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dragDropReducer, initialState);

  const startDrag = useCallback((data: DragData) => {
    dispatch({ type: 'START_DRAG', payload: data });
  }, []);

  const endDrag = useCallback((result?: DropResult) => {
    dispatch({ type: 'END_DRAG', payload: result });
  }, []);

  const registerDropTarget = useCallback((id: string, accepts: DragType[]) => {
    dispatch({
      type: 'REGISTER_TARGET',
      payload: { id, accepts },
    });
  }, []);

  const unregisterDropTarget = useCallback((id: string) => {
    dispatch({ type: 'UNREGISTER_TARGET', payload: id });
  }, []);

  const canDropOnTarget = useCallback(
    (targetId: string): boolean => {
      if (!state.isDragging || !state.dragData) {
        return false;
      }

      const target = state.dropTargets.get(targetId);
      if (!target) {
        return false;
      }

      return target.accepts.includes(state.dragData.type);
    },
    [state.isDragging, state.dragData, state.dropTargets]
  );

  const getDropTargets = useCallback((): Map<string, DropTarget> => {
    return new Map(state.dropTargets);
  }, [state.dropTargets]);

  const contextValue = useMemo<DragDropContextValue>(
    () => ({
      isDragging: state.isDragging,
      dragData: state.dragData,
      startDrag,
      endDrag,
      registerDropTarget,
      unregisterDropTarget,
      canDropOnTarget,
      getDropTargets,
    }),
    [
      state.isDragging,
      state.dragData,
      startDrag,
      endDrag,
      registerDropTarget,
      unregisterDropTarget,
      canDropOnTarget,
      getDropTargets,
    ]
  );

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
};

/** Default no-op context for graceful degradation outside provider */
const defaultContext: DragDropContextValue = {
  isDragging: false,
  dragData: null,
  startDrag: () => {
    console.warn('DragDropProvider not found in tree');
  },
  endDrag: () => {
    console.warn('DragDropProvider not found in tree');
  },
  registerDropTarget: () => {
    console.warn('DragDropProvider not found in tree');
  },
  unregisterDropTarget: () => {
    console.warn('DragDropProvider not found in tree');
  },
  canDropOnTarget: () => false,
  getDropTargets: () => new Map(),
};

/**
 * useDragDropContext - Access drag-drop context
 *
 * Returns the context value or a default no-op implementation
 * if used outside the provider.
 */
export const useDragDropContext = (): DragDropContextValue => {
  const context = useContext(DragDropContext);
  return context ?? defaultContext;
};

export { DragDropContext };
