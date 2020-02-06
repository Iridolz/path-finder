import React, { useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

function Main() {
    const p = {
        type: 0 // default rect type
    }

    const size = {
        width: window.innerWidth,
        height: window.innerHeight,
        rect: window.innerWidth / 10,
        rows: parseInt(window.innerHeight / (window.innerWidth / 10)),
        columns: 10,
    }

    const [tab, setTab] = useState(Array.from({length: size.columns},()=> Array.from({length: size.rows}, () => Object.create(p))));
    const [path, setPath] = useState([])

    const finish = async (prevMoves) => {
        console.log('-----' + path)
        console.log(' OK OK ')
        for (let i = 0; i < prevMoves.length; i++) {
            let newTab = [...tab]
            newTab[prevMoves[i][0]][prevMoves[i][1]].type = 5
            setTab(newTab)
            await sleep(300)
        }
    }

    // if (path.length !== 0) {
    //     console.log(path)
    //     for (let i = 0; i < path.length; i++) {
    //         let newTab = [...tab]
    //         newTab[path[i][0]][path[i][1]].type = 5
    //         setTab(newTab)
    //         await sleep(300)
    //     }
    //     console.log(' OK OK ')
    // }

    // Rect type
    const RectType = [
        {type: 0, color: 'white', name: 'empty'},
        {type: 1, color: 'black', name: 'black'},
        {type: 2, color: 'green', name: 'start'},
        {type: 3, color: 'red', name: 'end'},
        {type: 4, color: 'grey', name: 'checked'},
        {type: 5, color: 'blue', name: 'path'},
    ]

    const nextRectType = (actual) => {
        return (actual + 1) % 4
    }

    const getColorFromType = (type) => {
        return RectType[type].color
    }

    const RectOnClick = (e) => {
        let newTab = [...tab]
        newTab[e.i][e.n].type = nextRectType(tab[e.i][e.n].type)
        setTab(newTab)
    }

    const isRectExist = (i, n) => {
        if (0 > i || i > size.columns - 1)
            return false
        if (0 > n || n > size.rows - 1)
            return false
        if (tab[i][n].type === 1)
            return false
        return true
    }

    const checkPrevMoves = (i, n, prevMoves) => {
        // console.log(prevMoves)
        for (let index = 0; index < prevMoves.length; index++)
            if (prevMoves[index][0] === i && prevMoves[index][1] === n) {
                return false
            }
        return true
    }

    const updatePrevMoves = (i, n, prevMoves) => {
        if (prevMoves.length >= 4) {
            prevMoves.shift()
            prevMoves.push([i, n])
            return prevMoves
        }
        console.log(prevMoves)
        prevMoves.push([i, n])
        return prevMoves
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const engine = async (i, n, prevMoves) => {
        console.log(prevMoves)
        if (path.length !== 0) {
            return
        }
        // prevMoves = updatePrevMoves(i, n, prevMoves)
        prevMoves.push([i, n])
        if (tab[i][n].type === 3) {
            console.log('FINDED')
            setPath(prevMoves)
            finish([...prevMoves])
            return true;
        }
        let newTab = [...tab]
        newTab[i][n].type = 4
        setTab(newTab)
        await sleep(300)
        var ret;
        if (checkPrevMoves(i + 1, n, prevMoves) === true && isRectExist(i + 1, n) === true) {
            ret = engine(i + 1, n, [...prevMoves])
            if (ret === true)
                return
        }
        if (checkPrevMoves(i - 1, n, prevMoves) === true && isRectExist(i - 1, n) === true) {
            ret = engine(i - 1, n, [...prevMoves])
            if (ret === true)
                return
        }
        if (checkPrevMoves(i, n + 1, prevMoves) === true && isRectExist(i, n + 1) === true) {
            ret = engine(i, n + 1, [...prevMoves])
            if (ret === true)
                return
        }
        if (checkPrevMoves(i, n - 1, prevMoves) === true && isRectExist(i, n - 1) === true) {
            ret = engine(i, n - 1, [...prevMoves])
            if (ret === true)
                return
        }
        return [i, n]
    }

    const run = async () => {
        let ret = await engine(0, 0, new Array)
        console.log(ret)
    }

    return (
      <div>
        <Stage width={size.width} height={size.height}>
          <Layer>
            <Text
            x={0}
            y={0}
            text='RUN'
            fontSize={100}
            onClick={() => run()}
            />
            {
                tab.map((row, i) => (
                    row.map((column, n) => (
                        <Rect
                        i={i}
                        n={n}
                        x={i * (size.rect)}
                        y={(size.rect) + n * (size.height / size.rows)}
                        width={(size.rect)}
                        height={(size.rect)}
                        fill={getColorFromType(column.type)}
                        shadowBlur={10}
                        onClick={e => RectOnClick(e.target.attrs)}
                        />
                    ))
                ))
            }
          </Layer>
        </Stage>
      </div>
    );
  }

export default Main;
