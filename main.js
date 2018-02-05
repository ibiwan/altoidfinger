const Players = {
    x: '&times;',
    o: 'o',
    cat: 'cats-game'
}

const GameTypes = {
    vsComputer: 'vs-computer',
    twoPlayer: 'two-player',
}

const Strategies = {
    random: 'random',
    winInOne: 'win-in-one',
    playWorst: 'worst-move',
    playBest: 'best-move',
}

const Modes = {
    start: 'start',
    playerSelect: 'player-select',
    playersTurn: 'players-turn',
    computersTurn: 'computers-turn',
    gameFinish: 'game-finish',
}

// all boxes in game board
const boxes = ['box1', 'box2', 'box3', 'box4', 'box5', 'box6', 'box7', 'box8', 'box9']

// all possible win lines
const lines = [
    ['box1', 'box2', 'box3'],
    ['box4', 'box5', 'box6'],
    ['box7', 'box8', 'box9'],
    ['box1', 'box4', 'box7'],
    ['box2', 'box5', 'box8'],
    ['box3', 'box6', 'box9'],
    ['box1', 'box5', 'box9'],
    ['box3', 'box5', 'box7'],
]

const emptyBoard = boxes.reduce(
    (acc, curr) => {
        acc[curr] = null
        return acc
    }, {})

const data = {
    whoseTurn: null,
    computerPlays: null,
    gameType: null,
    mode: null,
    theBoard: jQuery.extend({}, emptyBoard),
    message: null,
    layout: [
        ['box1', 'box2', 'box3'],
        ['box4', 'box5', 'box6'],
        ['box7', 'box8', 'box9']
    ]
}

const otherPlayer = p => p === Players.x ? Players.o : Players.x

function setMessage(message) {
    data.message = message
}

function state(mode, message) {
    data.mode = mode

    if (message) {
        return setMessage(message)
    }

    switch (mode) {
        // case Modes.gameFinish: // MUST specify
        case Modes.start:
            return setMessage('Select Play Mode:')
        case Modes.playerSelect:
            return setMessage('Select Player Symbol:')
        case Modes.playersTurn:
            return setMessage('Current Player: ' + data.whoseTurn)
        case Modes.computersTurn:
            return setMessage('Please Wait For The Computer...')
        default:
            return setMessage(false)
    }
}

// aBoard is object of boxname:playermark
// returns playermark if win, else false
function winCheck(aBoard) {
    for (let line of lines) {
        let [a, b, c] = line
        if (
            aBoard[a] !== null &&
            aBoard[a] === aBoard[b] &&
            aBoard[b] === aBoard[c]
        ) {
            return aBoard[a] // returns winning player
        }
    }
    for (let box of boxes) {
        if (!aBoard[box]) {
            return false // game can continue
        }
    }
    return Players.cat // no more moves and no winner
}

function beginGame() {
    data.theBoard = jQuery.extend({}, emptyBoard)

    return state(Modes.start)
}


function forfeit() {
    return state(
        Modes.gameFinish,
        'Player Forfeited: ' + data.whoseTurn + ' <br /> ' + 'Player ' + otherPlayer(data.whoseTurn) + ' wins!',
    )
}

function gameTypeSelect(type) {
    data.gameType = type
    data.whoseTurn = Players.x
    switch (data.gameType) {
        case GameTypes.vsComputer:
            return state(Modes.playerSelect)
        case GameTypes.twoPlayer:
            return state(Modes.playersTurn)
    }
}

function playerSelect(who) {
    console.log('player selecting name', who)

    data.humanPlays = who
    data.computerPlays = otherPlayer(data.humanPlays)

    if (data.computerPlays === Players.x) {
        state(Modes.computersTurn)
        return computerMove()
    } else {
        return state(Modes.playersTurn)
    }
}

function cellSelect(move) {
    if (data.mode !== Modes.playersTurn) {
        return
    }
    if (data.theBoard[move] !== null) {
        return
    }

    console.log('making move: ' + data.whoseTurn + ' to ' + move)
    data.theBoard[move] = data.whoseTurn
    end = winCheck(data.theBoard)

    if (end) {
        if (end === Players.cat) {
            return state(
                Modes.gameFinish,
                'Cat\'s Game!'
            )
        }

        return state(
            Modes.gameFinish,
            data.whoseTurn + ' Wins!'
        )

    }

    if (data.gameType === GameTypes.vsComputer) {
        data.whoseTurn = data.computerPlays
        state(Modes.computersTurn)
        return computerMove()
    }

    data.whoseTurn = otherPlayer(data.whoseTurn)
    return state(Modes.playersTurn)
}


const isAvailable = (move, aBoard) => aBoard[move] === undefined

function getBestMove(aBoard) {
    win = getWinningMove(aBoard)
    if (win) {
        return win
    }

    // console.log('getBestMove');return
    bestScore = -20
    bestMove = null
    for (let box of boxes) {
        if (!isAvailable(box, aBoard)) {
            continue
        }
        var testBoard = jQuery.extend({}, aBoard)
        testBoard[box] = data.whoseTurn
        console.log('test theBoard: ', testBoard)
        winner = winCheck(testBoard)
        if (winner) {
            switch (winner) {
                case data.whoseTurn:
                    score = 10
                    break
                case otherPlayer(data.whoseTurn):
                    score = -10
                    break
                case Players.cat:
                    score = 0
                    break
            }
            if (score > bestScore) {
                bestScore = score
                bestMove = box
            }
            continue
        }
        // if this move doesn't end the game, recurse
        score = getWorstMove(testBoard)
        if (score > bestScore) {
            bestScore = score
            bestMove = box
        }
    }
    return bestMove
}

function getWorstMove(aBoard) {
    // console.log('getWorstMove');return
    foe = otherPlayer(data.whoseTurn)

    worstScore = 20
    worstMove = null
    for (let box of boxes) {
        if (!isAvailable(box, aBoard)) {
            continue
        }
        var testBoard = jQuery.extend({}, aBoard)
        testBoard[box] = foe
        winner = winCheck(testBoard)
        if (winner) {
            switch (winner) {
                case data.whoseTurn:
                    score = 10
                    break
                case otherPlayer(data.whoseTurn):
                    score = -10
                    break
                case Players.cat:
                    score = 0
                    break
            }
            if (score < worstScore) {
                worstScore = score
                worstMove = box
            }
            continue
        }
        // if this move doesn't end the game, recurse
        score = getBestMove(testBoard)
        if (score < worstScore) {
            worstScore = score
            worstMove = box
        }
    }
    return worstMove
}

function getWinningMove(aBoard) {
    console.log('getWinningMove', aBoard)

    for (let box of boxes) {
        if (!isAvailable(box, aBoard)) {
            continue
        }
        var testBoard = jQuery.extend({}, aBoard)
        testBoard[box] = data.whoseTurn

        win = winCheck(testBoard)
        if (win === data.whoseTurn) {
            return box
        }
    }
    return null
}

function selectMove(strategy) {
    // console.log('selectMove');return
    if (strategy === Strategies.random) {
        do {
            var box = boxes[Math.floor(Math.random() * boxes.length)]
        } while (!isAvailable(box, data.theBoard))
        return box
    }
    if (strategy === Strategies.winInOne) {
        move = getWinningMove()
            // console.log('move',move)
        ret = move ? move : selectMove(Strategies.random)
            // console.log('ret',ret);return 'box1'
        return ret
    }
    if (strategy === Strategies.playBest) {
        move = getBestMove(data.theBoard)
        return move ? move : selectMove(Strategies.random)
    }
}

function computerMove() {
    console.log('THINKING....')

    // box = selectMove(Strategies.playBest) // WHAT AI STRATEGY TO USE...
    box = selectMove(Strategies.random) // WHAT AI STRATEGY TO USE...

    console.log('Selected Move: ' + box)

    cell = $('#' + box)

    cell.html(data.whoseTurn)
    data.theBoard[box] = data.whoseTurn
    end = winCheck(data.theBoard)

    if (end) {
        if (end === Players.cat) {
            return state(
                Modes.gameFinish,
                'Players.cat\'s Game!'
            )
        }

        return state(
            Modes.gameFinish,
            otherPlayer(data.computerPlays) + ' Loses'
        )
    }

    data.whoseTurn = otherPlayer(data.whoseTurn)
    return state(Modes.playersTurn)
}

$(() => {
    let app = new Vue({
        el: '#app',
        data: data,
        methods: {
            forfeit: forfeit,
            playerSelect: playerSelect,
            gameTypeSelect: gameTypeSelect,
            cellSelect: cellSelect,
            beginGame: beginGame,
        },
    })
    app.beginGame()
})
