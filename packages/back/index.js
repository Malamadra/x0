import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'
import { isEqual } from 'lodash'
import { uniq } from 'lodash'

const wss = new WebSocket.Server({ port: 4000, isServer: true })

class Game {
  constructor() {
    this.player1Id = ''
    this.player2Id = ''
    this.putsX = ''
    this.lastCommitUserId = ''
    this.field = Game.getInitialField()
  }

  static getInitialField() {
    return Array(3)
      .fill(null)
      .map(() => ['E', 'E', 'E'])
  }

  status(userId) {
    if (this.player1Id && this.player2Id) {
      return 'GAME_STARTED'
    }
    if (!this.player1Id && !this.player2Id) {
      return 'INIT_GAME'
    }
    if (this.player1Id === userId) {
      return 'YOU_STARTED'
    }

    return 'JOIN_GAME'
  }

  isInitialFieldState() {
    return isEqual(this.field, Game.getInitialField())
  }

  checkIfCoordinatesFree({ cellIndex, rowIndex }) {
    return this.field[rowIndex][cellIndex] === 'E'
  }

  initGame(userId) {
    this.player1Id = userId
  }

  joinGame(userId) {
    this.player2Id = userId
  }

  commit(userId, { cellIndex, rowIndex }) {
    if (this.isInitialFieldState()) {
      this.putsX = userId
      this.lastCommitUserId = userId
      this.field[rowIndex][cellIndex] = 'X'
    } else if (userId !== this.lastCommitUserId) {
      const isFree = this.checkIfCoordinatesFree({ rowIndex, cellIndex })

      if (isFree) {
        const symbol = userId === this.putsX ? 'X' : '0'
        this.field[rowIndex][cellIndex] = symbol
        this.lastCommitUserId = userId
      }
    }
  }

  checkWinSymbol () {
    const combinations = []


    for (let rowIndex = 0; rowIndex < this.field.length; rowIndex++) {
      const row = this.field[rowIndex]
      combinations.push(row)
    }


    for (let columnIndex = 0; columnIndex < this.field[0].length; columnIndex++) {
      const column = []
      for (let rowIndex = 0; rowIndex < this.field.length; rowIndex++) {
        column.push(this.field[rowIndex][columnIndex])
      }
      combinations.push(column)
    }

    const diagonal1 = []
    const diagonal2 = []

    for (let colRowIndex = 0; colRowIndex < this.field.length; colRowIndex++) {
      diagonal1.push(this.field[colRowIndex][colRowIndex])
    }

    for (let colRowIndex = this.field.length - 1; colRowIndex >= 0; colRowIndex--) {
      diagonal2.push(this.field[colRowIndex][colRowIndex])
    }

    combinations.push(diagonal1)
    combinations.push(diagonal2)

    const winCombination = combinations
      .filter(comb => !comb.includes('E'))
      .find(comb => uniq(comb).length === 1)

    if (!!winCombination) {
      return winCombination[0]
    } else {
      return null
    }
  }

  checkWinnerId () {
    const symbol = this.checkWinSymbol()

    if (!!symbol) {
      const isPlayer1PutsX = this.putsX === this.player1Id

      if (isPlayer1PutsX) {
        if (symbol === 'X') {
          return this.player1Id
        } else {
          return this.player2Id
        }
      } else {
        if (symbol === 'X') {
          return this.player2Id
        } else {
          return this.player1Id
        }
      }
    }
  }
}

const game = new Game()

wss.on('connection', function connection(ws) {
  const userId = uuidv4()
  ws.id = userId

  const sendGameStatus = () => {
    wss.clients.forEach((client) => {
      const gameStatus = game.status(client.id)

      client.send(
        JSON.stringify({
          type: 'GAME_STATUS',
          value: gameStatus
        })
      )
    })
  }

  const sendField = () => {
    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: 'FIELD',
          value: game.field
        })
      )
    })
  }

  const sendGameResult = () => {
    const winnerId = game.checkWinnerId()
    wss.clients.forEach((client) => {

      if (winnerId) {
        if (winnerId === client.id) {
          client.send(
            JSON.stringify({
              type: 'GAME_RESULT',
              value: 'WINNER'
            })
          )
        } else {
          client.send(
            JSON.stringify({
              type: 'GAME_RESULT',
              value: 'LOSER'
            })
          )
        }
      }
    })
  }

  sendGameStatus()

  ws.on('message', (message) => {
    const { type, payload } = JSON.parse(message)

    if (type === 'CONTROL_ACTION') {
      switch (payload) {
        case 'INIT_GAME': {
          game.initGame(userId)
          sendGameStatus()
          break
        }
        case 'JOIN_GAME': {
          game.joinGame(userId)
          sendGameStatus()
          sendField()
          break
        }
      }
    }

    if (type === 'GAME_ACTION') {
      game.commit(userId, payload)
      sendField()
      sendGameResult()
    }
  })
})
