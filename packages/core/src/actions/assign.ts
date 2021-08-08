import {
  EventObject,
  Assigner,
  PropertyAssigner,
  MachineContext,
  DAction
} from '../types';
import * as actionTypes from '../actionTypes';
import { DynamicAction } from '../../actions/DynamicAction';
import { updateContext } from '../updateContext';
import { toSCXMLEvent } from '../utils';
import { AssignActionObject, RaiseActionObject } from '..';

export type DynamicAssignAction<
  TContext extends MachineContext,
  TEvent extends EventObject
> = DAction<
  TContext,
  TEvent,
  AssignActionObject<TContext> | RaiseActionObject<TEvent>
>;

/**
 * Updates the current context of the machine.
 *
 * @param assignment An object that represents the partial context to update.
 */
export function assign<
  TContext extends MachineContext,
  TEvent extends EventObject = EventObject
>(
  assignment: Assigner<TContext, TEvent> | PropertyAssigner<TContext, TEvent>
): DynamicAssignAction<TContext, TEvent> {
  return new DynamicAction(
    actionTypes.assign,
    {
      assignment
    },
    (action, context, _event, { state }) => {
      try {
        const [nextContext, nextActions] = updateContext(
          context,
          _event,
          [action],
          state
        );

        return {
          type: action.type,
          params: {
            context: nextContext,
            actions: nextActions
          }
        } as AssignActionObject<TContext>;
      } catch (err) {
        // Raise error.execution events for failed assign actions
        return {
          type: actionTypes.raise,
          params: {
            _event: toSCXMLEvent({
              type: actionTypes.errorExecution,
              error: err
            } as any) // TODO: fix
          }
        } as RaiseActionObject<TEvent>;
      }
    }
  );
  // return {
  //   type: actionTypes.assign,
  //   assignment
  // };
}