'use strict';

(() => {

    class PuzzleRenderer {
        constructor(puzzle, canvas) {
            this.puzzle = puzzle;
            this.canvas = canvas;
            this.ctx = this.canvas.getContext('2d');
            this.TILE_SIZE = 70;
            this.image = document.createElement('img');
            this.image.src = 'img/owls.png';
            this.image.addEventListener('load', () => {
                // this.renderTile(9, 2, 1);
                // this.renderTile(12, 1, 3);
                this.render();
            });

            //clientX,Y starts from client web browser's left top is the starting 
            //use the getBoundingClientRect to get the canvas X,Y position
            this.canvas.addEventListener('click', e => {
                //if completed, it will not allow to click
                if (this.puzzle.getCompletedStatus()) {
                    return;
                }
                const rect = this.canvas.getBoundingClientRect();
                // console.log(e.clientX - rect.left, e.clientY - rect.top);
                const col = Math.floor((e.clientX - rect.left) / this.TILE_SIZE);
                const row = Math.floor((e.clientY - rect.top) / this.TILE_SIZE);
                console.log(col, row);
                this.puzzle.swapTiles(col, row);
                this.render();

                if (this.puzzle.isComplete()) {
                    this.puzzle.setCompletedStatus(true);
                    this.renderGameClear();
                }
            });
        }

        renderGameClear() {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); //filling the canvas size
            this.ctx.font = '28px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('GAME CLEAR!!', 40, 150);

        }
        render() {
            for (let row = 0; row < this.puzzle.getBoardSize(); row++) {
                for (let col = 0; col < this.puzzle.getBoardSize(); col++) {
                    this.renderTile(this.puzzle.getTiles(row, col), col, row);
                }
            }
        }

        renderTile(n, col, row) {
            if (n === this.puzzle.getBlankIndex()) {
                this.ctx.fillStyle = "#eeeeee";
                this.ctx.fillRect(
                    col * this.TILE_SIZE,
                    row * this.TILE_SIZE,
                    this.TILE_SIZE,
                    this.TILE_SIZE);
            } else {
                this.ctx.drawImage(
                    this.image,
                    (n % this.puzzle.getBoardSize()) * this.TILE_SIZE,
                    Math.floor(n / this.puzzle.getBoardSize()) * this.TILE_SIZE,
                    this.TILE_SIZE,
                    this.TILE_SIZE,
                    col * this.TILE_SIZE,
                    row * this.TILE_SIZE,
                    this.TILE_SIZE,
                    this.TILE_SIZE
                );
            }
        }

    }

    class Puzzle {
        constructor(level) {
            this.level = level;
            this.tiles = [
                [0, 1, 2, 3],
                [4, 5, 6, 7],
                [8, 9, 10, 11],
                [12, 13, 14, 15],
            ]
            this.UDLR = [
                [0, -1], //up
                [0, 1], //down
                [-1, 0], //left
                [1, 0], //right
            ]
            this.isCompleted = false;
            this.BOARD_SIZE = this.tiles.length;
            this.BLANK_INDEX = this.BOARD_SIZE ** 2 - 1;
            do {
                this.shuffle(this.level);
            } while (this.isComplete());
        }

        //getter for the completed status
        getCompletedStatus() {
            return this.isCompleted;
        }

        //getter for tiles
        getTiles(row, col) {
            return this.tiles[row][col];
        }

        //getter for boardsize
        getBoardSize() {
            return this.BOARD_SIZE;
        }

        //getter for blank
        getBlankIndex() {
            return this.BLANK_INDEX;
        }

        //setter for the completed status
        setCompletedStatus(value) {
            this.isCompleted = value;
        }

        shuffle(n) {
            let blankCol = this.BOARD_SIZE - 1;
            let blankRow = this.BOARD_SIZE - 1;

            for (let i = 0; i < n; i++) {
                let destCol;
                let destRow;
                do {
                    const direction = Math.floor(Math.random() * this.UDLR.length);

                    destCol = blankCol + this.UDLR[direction][0];
                    destRow = blankRow + this.UDLR[direction][1];

                } while (this.isOutside(destCol, destRow));

                [
                    this.tiles[blankRow][blankCol],
                    this.tiles[destRow][destCol],
                ] = [
                    this.tiles[destRow][destCol],
                    this.tiles[blankRow][blankCol],
                ];

                [blankCol, blankRow] = [destCol, destRow];
            }
        }

        swapTiles(col, row) {
            if (this.tiles[row][col] === this.BLANK_INDEX) {
                return;
            }
            //looking for the 4 ways of the tiles
            //each case it will look if the tile is 15
            for (let i = 0; i < this.UDLR.length; i++) {
                const destCol = col + this.UDLR[i][0];
                const destRow = row + this.UDLR[i][1];

                // switch (i) {
                //     case 0: //up
                //         destCol = col;
                //         destRow = row - 1;

                //         break;
                //     case 1: //down
                //         destCol = col;
                //         destRow = row + 1;

                //         break;
                //     case 2: //left
                //         destCol = col - 1;
                //         destRow = row;

                //         break;
                //     case 3: //right
                //         destCol = col + 1;
                //         destRow = row;

                //         break;

                // }

                //if the destcol&destrow is out of the range
                if (this.isOutside(destCol, destRow)) {
                    continue;
                }

                //if the destination has 15(blank) swap the position
                if (this.tiles[destRow][destCol] === this.BLANK_INDEX) {
                    [
                        this.tiles[row][col],
                        this.tiles[destRow][destCol],
                    ] = [
                        this.tiles[destRow][destCol],
                        this.tiles[row][col],
                    ];
                    break;
                }
            }
        }

        isOutside(destCol, destRow) {
            return (destCol < 0 || destCol > this.BOARD_SIZE - 1 ||
                destRow < 0 || destRow > this.BOARD_SIZE - 1);
        }

        isComplete() {
            let i = 0;
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    if (this.tiles[row][col] !== i++) {
                        return false;
                    }
                }
            }
            return true;
        }
    }

    const canvas = document.querySelector('canvas');
    if (typeof canvas.getContext === 'undefined') {
        return;
    }

    new PuzzleRenderer(new Puzzle(25), canvas);

})();