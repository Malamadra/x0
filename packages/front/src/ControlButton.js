import React from 'react'
import styled from 'styled-components'

const Btn = styled('button')``

const ControlButton = ({ status, commitControlAction }) => {
  let text = ''

  if (status === 'INIT_GAME') {
    text = 'Start new game'
  }

  if (status === 'JOIN_GAME') {
    text = 'Join the game'
  }

  if (status === 'GAME_STARTED') {
    text = 'Game has already started'
  }

  if (status === 'YOU_STARTED') {
    text = `You've started the game`
  }

  return (
    <Btn
      disabled={status === 'GAME_STARTED' || status === 'YOU_STARTED'}
      onClick={() => commitControlAction(status)}
    >
      {text}
    </Btn>
  )
}

export default ControlButton
