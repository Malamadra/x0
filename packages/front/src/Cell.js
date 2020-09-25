import React from 'react'
import styled from 'styled-components'

const CellWrapper = styled('div')`
  margin: 2px;
  width: 50px;
  height: 50px;
  border: 1px solid red;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const Cell = ({ cell, cellIndex, rowIndex, commitGameAction }) => {
  let label = ''

  if (cell === 'X') {
    label = 'X'
  }

  if (cell === '0') {
    label = '0'
  }

  return (
    <CellWrapper onClick={() => commitGameAction({ cellIndex, rowIndex })}>
      {!!label && label}
    </CellWrapper>
  )
}

export default Cell
