import {
  type BufferViewProps,
  type PrepareViewProps,
  type RoundSummaryViewProps,
  type TimerRunningViewProps,
  type VerdictViewProps,
} from './phases/shared'
import { BufferView } from './phases/BufferView'
import { PrepareView } from './phases/PrepareView'
import { RoundSummaryView } from './phases/RoundSummaryView'
import { TimerRunningView } from './phases/TimerRunningView'
import { VerdictView } from './phases/VerdictView'

export { BufferView, PrepareView, RoundSummaryView, TimerRunningView, VerdictView }

type PlayBoardPhasesProps =
  | ({ phase: 'timer-running' } & TimerRunningViewProps)
  | ({ phase: 'verdict' } & VerdictViewProps)
  | ({ phase: 'round-summary' } & RoundSummaryViewProps)
  | ({ phase: 'prepare' } & PrepareViewProps)
  | ({ phase: 'reveal-buffer' } & BufferViewProps)

export function PlayBoardPhases(props: PlayBoardPhasesProps) {
  switch (props.phase) {
    case 'timer-running':
      return <TimerRunningView {...props} />
    case 'verdict':
      return <VerdictView {...props} />
    case 'round-summary':
      return <RoundSummaryView {...props} />
    case 'prepare':
      return <PrepareView {...props} />
    case 'reveal-buffer':
      return <BufferView {...props} />
    default:
      return null
  }
}
