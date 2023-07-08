import { useMemo, type FC } from 'react'
import { Box, Text } from 'ink'
import ProgressBarPacman from 'ink-progress-bar-pacman'
import Gradient from 'ink-gradient'

import { useSize } from '../../hooks/useSize.js'
import { LOGO } from '../../constants/index.js'
import { type Store } from '../../helpers/Store.js'
import { useSelector } from '../../hooks/useSelector.js'
import { Menu, MenuItem } from '../../components/Menu/index.js'
import { Section } from '../../components/Section.js'
import { useMeasure } from '../../hooks/useMeasure.js'

export interface IStartUIStateLog<TType extends string> {
  id: string
  type: TType
}

export interface StartUIStateLogProgress extends IStartUIStateLog<'progress'> {
  total: number
  current: number
  label: (current: number, total: number) => string
}

export interface StartUIStateLogText extends IStartUIStateLog<'text'> {
  text: string
}

export type StartUIStateLog = StartUIStateLogProgress | StartUIStateLogText

export interface StartUIStateServer {
  id: string
  name: string
  logs: StartUIStateLog[]
}

export enum StartUIStateSourceStatus {
  Creating = 'creating',
  Refreshing = 'refreshing',
  Destroying = 'destroying',
  Running = 'running',
  Idle = 'idle',
  Disabled = 'disabled',
}

export interface StartUIStateSource {
  id: string
  name: string
  status: StartUIStateSourceStatus
}

export interface StartUIState {
  servers: StartUIStateServer[]
  logs: StartUIStateLog[]
  sources: StartUIStateSource[]
  outputDirectory: string | null
}

export interface StartUIProps {
  store: Store<StartUIState>
}

export interface StartUIHomeProps {
  store: Store<StartUIState>
}

export const StartUIHome: FC<StartUIHomeProps> = ({ store }) => {
  return (
    <Box flexDirection='row' flexGrow={1}>
      <Menu
        initial='Welcome'
        flexDirection='column'
        borderStyle='single'
        width={40}
      >
        <MenuItem name='Welcome'>
          <Box flexGrow={1} flexDirection='column' borderStyle='single'>
            <Gradient name='atlas'>
              <Text>{LOGO}</Text>
            </Gradient>
            <Text>{useSelector(store, state => state.outputDirectory)}</Text>
          </Box>
        </MenuItem>
        <MenuItem name='Logs'>
          <StartUILogs store={store} />
        </MenuItem>
        {useSelector(store, state => state.sources).map(source => (
          <MenuItem
            name={`sources:${source.id}`}
            label={`${source.name} - ${source.status}`}
          >
            <Section flexGrow={1} title={source.name} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export const StartUILogs: FC<{ store: Store<StartUIState> }> = ({ store }) => {
  const [ref, { height }] = useMeasure()

  return (
    <Section ref={ref} flexGrow={1} title='Logs'>
      <Box flexDirection='column'>
        {useSelector(store, state => state.logs)
          .slice(-height)
          .map(log => (
            <StartUILog key={`log.${log.id}`} log={log} />
          ))}
      </Box>
    </Section>
  )
}

export const StartUIServer: FC<{ server: StartUIStateServer }> = ({
  server,
}) => {
  return (
    <Box flexDirection='column'>
      {server.logs.slice(-(useSize('Y') - 2)).map(log => (
        <StartUILog key={`log.${log.id}`} log={log} />
      ))}
    </Box>
  )
}

export const StartUI: FC<StartUIProps> = ({ store }) => {
  return (
    <Box
      height={useSize('height')}
      width={useSize('width')}
      flexDirection='column'
    >
      <Menu initial='Home' justifyContent='space-around'>
        <MenuItem name='Home'>
          <StartUIHome store={store} />
        </MenuItem>
        {useSelector(store, state => state.servers).map(server => (
          <MenuItem
            key={`menu:servers:${server.id}`}
            name={`menu:servers:${server.id}`}
            label={server.name}
            component={<StartUIServer server={server} />}
          />
        ))}
      </Menu>
    </Box>
  )
}

export const StartUILog: FC<{ log: StartUIStateLog }> = ({ log }) => {
  if (log.type === 'progress') return <StartUILogProgress log={log} />

  if (log.type === 'text') return <StartUILogText log={log} />

  return null
}

export const StartUILogText: FC<{ log: StartUIStateLogText }> = ({ log }) => {
  return <Text>{log.text}</Text>
}

export const StartUILogProgress: FC<{ log: StartUIStateLogProgress }> = ({
  log,
}) => {
  const label = useMemo(() => log.label(log.current, log.total), [log])

  return (
    <Box>
      <Text>{label}</Text>
      <ProgressBarPacman
        width={process.stdout.columns - label.length}
        percent={log.current / log.total}
      />
    </Box>
  )
}
