import React from 'react'
import styled from 'styled-components'
import ControlButton from './ControlButton'
import Cell from './Cell'

const Row = styled('div')`
  display: flex;
  align-items: center;
`

class App extends React.Component {
  ws = new WebSocket('ws://localhost:4000')

  state = {
    status: '',
    field: null,
    gameResult: '',
  }

  commitControlAction = (action) => {
    this.ws.send(JSON.stringify({ type: 'CONTROL_ACTION', payload: action }))
  }

  commitGameAction = ({ rowIndex, cellIndex }) => {
    const action = {
      type: 'GAME_ACTION',
      payload: {
        rowIndex,
        cellIndex
      }
    }

    this.ws.send(JSON.stringify(action))
  }

  render() {
    const { status, field, gameResult } = this.state

    return (
      <div>
        {!!gameResult && gameResult}
        <div>
          {!!status && (
            <ControlButton
              status={status}
              commitControlAction={this.commitControlAction}
            />
          )}
        </div>
        {Array.isArray(field) && (
          <div>
            {field.map((row, rowIndex) => (
              <Row key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <Cell
                    key={cellIndex}
                    cell={cell}
                    cellIndex={cellIndex}
                    rowIndex={rowIndex}
                    commitGameAction={this.commitGameAction}
                  />
                ))}
              </Row>
            ))}
          </div>
        )}
      </div>
    )
  }

  componentDidMount() {
    this.ws.onopen = () => {
      console.log('connected')
    }

    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data)

      const { type, value } = data

      if (type === 'GAME_STATUS') {
        this.setState({ status: value })
      }

      if (type === 'FIELD') {
        this.setState({ field: value })
      }

      if (type === 'GAME_RESULT') {
        this.setState({ gameResult: value })
      }
    }

    this.ws.onclose = () => {}
  }
}

export default App
