import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
// import './Main.css'

function Main() {

    const size = {
        width: window.innerWidth,
        height: window.innerHeight,
        rect: window.innerWidth / 20,
        rows: 20,
        // rows: parseInt(window.innerHeight / (window.innerWidth / 20)),
        columns: 20,
    }

    const [tab, setTab] = useState(Array.from({length: size.columns}, () => Array.from({length: size.rows}, () => 0)));
    const [errorMsg, setErrorMsg] = useState('')
    let offSet = false // false = end flag not finded yet, true = finded
    const [cursor, setCursor] = useState(0)

    const intervalRef = useRef(null);
  
    useEffect(() => {
      return () => stopCounter(); // when App is unmounted we should stop counter
    }, []);

    const startCounter = () => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(10);
      };
    
    const stopCounter = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

    const cursorSelector = (i) => {
        if (cursor === i) {
            setCursor(0)
        }
        if (cursor !== i) {
            setCursor(i)
        }
    }

    const RectOnSelect = (e) => {
        if (cursor !== 0 && intervalRef.current > 0) {
            let i = e.split('-')[0]
            let n = e.split('-')[1]
            let newTab = [...tab]
            newTab[i][n] = cursor
            setTab(newTab)
        }
    }

    // document.addEventListener('mousemove', (e) => {
    //     if (cursor !== 0) {
    //         let c = document.getElementsByClassName('cursor')
    //         c[0].style.left = e.clientX + 'px'
    //         c[0].style.top = e.clientY + 'px'
    //     }
    // })

    // function that display path when end flag has been find
    const finish = async (prevMoves) => {
        // start at second element to not remove start flag
        // end before last element to not remove end flag
        for (let i = 1; i < prevMoves.length - 1; i++) {
            let newTab = [...tab]
            newTab[prevMoves[i][0]][prevMoves[i][1]] = 5
            setTab(newTab)
            await sleep(300)
        }
    }

    // Rect type
    const RectType = [
        {type: 0, color: 'white', name: 'empty'},
        {type: 1, color: 'black', name: 'wall'},
        {type: 2, color: 'green', name: 'start'},
        {type: 3, color: 'red', name: 'end'},
        {type: 4, color: 'grey', name: 'checked'},
        {type: 5, color: 'yellow', name: 'path'},
    ]

    const nextRectType = (actual) => {
        return (actual + 1) % 4
    }

    const getColorFromType = (type) => {
        return RectType[type].color
    }

    const RectOnClick = (e) => {
        let i = e.split('-')[0]
        let n = e.split('-')[1]
        let newTab = [...tab]
        newTab[i][n] = nextRectType(tab[i][n])
        setTab(newTab)
    }

    // function that check if a  move is valid
    const isMoveValid = (i, n) => {
        if (0 > i || i > size.columns - 1)
            return false
        if (0 > n || n > size.rows - 1)
            return false
        if (tab[i][n] === 1)
            return false
        if (tab[i][n] === 4)
            return false
        return true
    }

    // function that check previous move to prevent circle/infinite checking
    const checkPrevMoves = (i, n, prevMoves) => {
        for (let index = 0; index < prevMoves.length; index++)
            if (prevMoves[index][0] === i && prevMoves[index][1] === n) {
                return false
            }
        return true
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // function that make a move
    const doMove = (i, n, prevMoves) => {
        // check if move is a valid move and if end flag is not find yet
        if (offSet === false && isMoveValid(i, n) === true && checkPrevMoves(i, n, prevMoves) === true) {
            engine(i, n, [...prevMoves])
        }
    }

    // engine function
    const engine = async (i, n, prevMoves) => {
        prevMoves.push([i, n])
        // if end flag is found start display shortest path
        if (tab[i][n] === 3) {
            offSet = true
            finish([...prevMoves])
            return
        }
        // if current pos is a start flag do not update state as checked
        if (tab[i][n] !== 2) {
            let newTab = [...tab]
            newTab[i][n] = 4
            setTab(newTab)
        }
        await sleep(300)
        // try to make a move all direction
        doMove(i + 1, n, prevMoves)
        doMove(i - 1, n, prevMoves)
        doMove(i, n + 1, prevMoves)
        doMove(i, n - 1, prevMoves)
    }

    // find a flag position by his number
    const findFlagByNumber = (flag) => {
        for (var i = 0; i < tab.length; i++) {
            for (var n = 0; n < tab[i].length; n++) {
                if (tab[i][n] === flag) {
                    return ([i, n])
                }
            }
        }
    }

    // check if end/start flag exist
    const errorHandling = () => {
        let tmp = tab.flat()
        if (!tmp.find(e => e === 2)) {
            setErrorMsg('Please set a start flag')
            return false
        }
        if (!tmp.find(e => e === 3)) {
            setErrorMsg('Please set a end flag')
            return false
        }
        setErrorMsg('')
        return true
    }

    // run function
    const run = async () => {
        if (errorHandling() === true) {
            let start = findFlagByNumber(2)
            await engine(start[0], start[1], [])
        }
    }

    // function that reset all variable in order to restart
    const reset = () => {
        offSet = false
        setTab(Array.from({length: size.columns}, () => Array.from({length: size.rows}, () => 0)))
    }

    return (
      <div className='noselect'>
        {<div className='cursor' style={{background: getColorFromType(cursor)}}></div>}
        <div className='wrapper'>
        <div className='right'>
            <div className='button' id='run' onClick={() => run()}>
                <p>RUN</p>
            </div>
            <br></br>
            <div className='button' id='reset' onClick={() => reset()}>
                <p>Reset</p>
            </div>
            <div>
                <p>{errorMsg}</p>
            </div>
            {<div className='selector' id='1' style={{background: getColorFromType(1)}} onClick={e => cursorSelector(parseInt(e.target.id))}></div>}
        </div>
        <div className='grid'
            onMouseDown={e => startCounter()}
            onMouseUp={e => stopCounter()}
            onMouseLeave={e => stopCounter()}>
            {
                tab.map((row, i) => (
                    <div className='column'>
                        {
                            row.map((column, n) => (
                                <div className='rect'
                                    style={{background: getColorFromType(column)}}
                                    onClick={e => RectOnClick(e.target.id)} id={`${i}-${n}`}
                                    onMouseOver={e => RectOnSelect(e.target.id)}>
                                </div>
                        ))
                        }
                    </div>
                ))
            }
        </div>
        </div>
      </div>
    );
  }

export default Main;
