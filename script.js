var board,
    game = new Chess(), 
    whiteDepth = 1, 
    blackDepth = 1;

/*The "AI" part starts here */


/* board visualization and games state handling */

var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};
var checkmate = function(game) {
    if(game.ugly_moves().length === 0)
    { 
        var winner = movingnow + 'Checkmate';
        
        var checkmateCount = localStorage.getItem(winner)
        localStorage.setItem(winner, ++checkmateCount);
        log(winner);
        return winner;
    }else{
        var checkmateCount = localStorage.getItem('stalemate')
        localStorage.setItem('stalemate', ++checkmateCount);
        log('stalemate');
        return 'stalemate';
    }
};

var movingnow = '';

var whiteMove = function () {
    movingnow = 'white';
    //var bestMove = getBestMove(game, whiteDepth, minimaxRootWhite);
    //var bestMove = randomMove(game);
    var bestMove = randomCapture(game);
    //var bestMove = bestCapture(game);
    //var bestMove = avoidBeingCaptured(game);

    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());





    
    if (game.game_over()) {
        //alert('Game over ['+checkmate(game)+']');
        checkmate(game);
        stopGame();
        return;
    }
    window.setTimeout(blackMove, 2);
};

var blackMove = function () {
    movingnow = 'black';
    //var bestMove = getBestMove(game, blackDepth, minimaxRoot);
    var bestMove = randomMove(game);
    //var bestMove = randomCapture(game);
    //var bestMove = bestCapture(game);
    game.ugly_move(bestMove);
    board.position(game);
    renderMoveHistory(game.history());
    if (game.game_over()) {
      //  alert('Game over ['+checkmate(game)+']');
      checkmate(game);
      stopGame();  
      return;
    }
    window.setTimeout(whiteMove, 2);
};

var getRandomMove = function(moves){
    //get random index
    var turnRandomIndex = Math.floor(Math.random() * moves.length);
    //get move from random index
    var randomMoove = moves[turnRandomIndex];
    //return move
    return randomMoove;
};

/**
 * RANDOMMOVE AI
 * @param {*} game 
 */
var randomMove = function(game) {
    //get moves
    var turnPossibleMoves = game.ugly_moves();
    //get random move
    var randomMoove = getRandomMove(turnPossibleMoves);
    //return move
    return randomMoove;
};


/**
 * RANDOMCAPTURE AI
 * @param {*} possibleMoves 
 */
var getCaptureMoves = function (possibleMoves) {
    //declare the capture moves array
    var captureMoves = [];
    //loop over all the moves
    var i = 0;
    while (i < possibleMoves.length) {
        //get a single move from all moves using the index
        var move = possibleMoves[i];
        //if the move is captured
        if (move.captured) {
            //add the move to the capture moves array
            captureMoves.push(move);
        }
        i++;
    }
    return captureMoves;
};

var randomCapture = function (game){ 
    //get all the capturemoves
    var captureMoves = getCaptureMoves(game.ugly_moves());
    //declare nextmove
    var nextMove;
    //if there are capturemoves, get  a random one
    if (captureMoves.length > 0) {
        nextMove = getRandomMove(captureMoves);
    } else {
        //else get any random move from the game
        nextMove = randomMove(game);
    }
    //return nextmove
    return nextMove;
};
/**
 * BESTCAPTURE AI
 * @param {*} game 
 */
var bestCapture = function (game) {
    //get all the capture moves
    var captureMoves = getCaptureMoves(game.ugly_moves());
    //declare move var
    var theMove;

    //If there are no capture moves, then make a random move
    if (captureMoves.length === 0) {
        theMove = randomMove(game);
    } else {
        //if there are capture moves, select the most valuable piece
        
        //first, get the first capture move
        theMove = captureMoves[0];

        //loop over all the capture moves comparing the one we have to the next one
        for (i = 0; i < captureMoves.length; i++) {
            //compare the captured piece to the next move's captured piece.
            var theOtherMove = captureMoves[i];
            //choose the move with the best captured piece
            //if the captured piece is a king, do it
            if (theMove.captured === 'k') {
                break;
            }
            //if there are no captures that result in a king, search for a queen
            else if(theMove.captured === 'q' && 'k'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if there are no queen captures, find a rook
            else if(theMove.captured === 'r' && 'kq'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if there are no rooks to capture, find a knight
            else if(theMove.captured === 'n' && 'kqr'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if there are no knights, find a pawn
            else if(theMove.captured === 'b' && 'kqrn'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if you've gotten this far, there has to be a pawn.
            else if(theMove.captured === 'p' && 'kqrnb'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
        }
    }
    return theMove;
};

var resultsInCapture = function(theMove){
    game.ugly_move(theMove);
    var foundCapture = (getCaptureMoves(game.ugly_moves()).length > 0);
    game.undo();
    return foundCapture;
};

/**
 * AVOIDBEINGCAPTURED AI
 * @param {*} game 
 */
var avoidBeingCaptured = function (game) {
    //get all the capture moves
    var captureMoves = getCaptureMoves(game.ugly_moves());
    //declare move var
    var theMove;

    //If there are no capture moves, then make a random move
    if (captureMoves.length === 0) {
        theMove = randomMove(game);
        if(resultsInCapture(theMove))
        {
            theMove = randomMove(game);
        }
    } else {
        //if there are capture moves, select the most valuable piece
        
        //first, get the first capture move
        theMove = captureMoves[0];

        //loop over all the capture moves comparing the one we have to the next one
        for (i = 0; i < captureMoves.length; i++) {
            //compare the captured piece to the next move's captured piece.
            var theOtherMove = captureMoves[i];
            //choose the move with the best captured piece
            //if the captured piece is a king, do it
            if (theMove.captured === 'k') {
                break;
            }
            //if there are no captures that result in a king, search for a queen
            else if(theMove.captured === 'q' && 'k'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if there are no queen captures, find a rook
            else if(theMove.captured === 'r' 
                && 'kq'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if there are no rooks to capture, find a knight
            else if(theMove.captured === 'n' 
                && 'kqr'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if there are no knights, find a pawn
            else if(theMove.captured === 'b' 
                && 'kqrn'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
            //if you've gotten this far, there has to be a pawn.
            else if(theMove.captured === 'p' 
                && 'kqrnb'.search(theOtherMove.captured) > -1){
                theMove = theOtherMove;
            }
        }
    }
    return theMove;
};

var positionCount;
var getBestMove = function (game, depth, findBestMove) {
    if (game.game_over()) {
        //alert('Game over');
        return;
    }

    positionCount = 0;
    //var depth = parseInt($('#search-depth').find(':selected').text());

    var d = new Date().getTime();
    var bestMove = findBestMove(depth, game, true);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    return bestMove;
};

var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};
var log = function (text) {
    var historyElement = $('#move-history');
    historyElement.append('<span>' + text + ' </span><br>');
    historyElement.scrollTop(historyElement[0].scrollHeight);

};
var onDrop = function (source, target) {

    // Removing to make both sides fully CPU, not first move as human
    // var move = game.move({
    //     from: source,
    //     to: target,
    //     promotion: 'q'
    // });
    startGame();
};
var startGame = function() {
    removeGreySquares();
    // if (move === null) {
    //     return 'snapback';
    // }

    renderMoveHistory(game.history());
    window.setTimeout(whiteMove, 1000);
};
var stopGame = function () {
    var whiteCheckmate = parseInt(localStorage.getItem('whiteCheckmate'));
    whiteCheckmate = whiteCheckmate ? whiteCheckmate : 0;
    var blackCheckmate = parseInt(localStorage.getItem('blackCheckmate'));
    blackCheckmate = blackCheckmate ? blackCheckmate : 0;
    var stalemate = parseInt(localStorage.getItem('stalemate'));
    stalemate = stalemate ? stalemate : 0;
    if (whiteCheckmate + blackCheckmate + stalemate >= 10000) {
        var result = " black checkmate: "+blackCheckmate + ", " + " white checkmate: "+ whiteCheckmate + "," + " stalemate: "+stalemate;
        //log the results
        log(result);
        //alert the results
        alert(result);
        localStorage.removeItem('whiteCheckmate');
        localStorage.removeItem('blackCheckmate');
        localStorage.removeItem('stalemate');
    }else{
        //automatically reload here
        location.reload();
    }
};

var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function(square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
};

var removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);

startGame();