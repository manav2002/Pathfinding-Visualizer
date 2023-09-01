
import React, { useState } from 'react';
import './App.css';

// Constants
const ROWS = 20;
const COLS = 40;
const START_NODE_ROW = 10;
const START_NODE_COL = 5;
const END_NODE_ROW = 10;
const END_NODE_COL = 35;

const createInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (row, col) => {
  return {
    row,
    col,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isEnd: row === END_NODE_ROW && col === END_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const Node = ({ row, col, isStart, isEnd, isWall, onMouseDown, onMouseEnter, onMouseUp }) => {
  const extraClassName = isStart ? 'node-start' : isEnd ? 'node-end' : isWall ? 'node-wall' : '';

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    ></div>
  );
};

const App = () => {
  const [grid, setGrid] = useState(createInitialGrid());
  const [mouseIsPressed, setMouseIsPressed] = useState(false);

  const handleMouseDown = (row, col) => {
    if (isNodeStart(grid, row, col) || isNodeEnd(grid, row, col)) {
      setMouseIsPressed(true);
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
      setMouseIsPressed(true);
    }
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const visualizeDijkstra = () => {
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const endNode = grid[END_NODE_ROW][END_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, endNode);
    const shortestPath = getShortestPath(endNode);
    animateDijkstra(visitedNodesInOrder, shortestPath);
  };

  const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  const isNodeStart = (grid, row, col) => {
    const node = grid[row][col];
    return node.isStart;
  };

  const isNodeEnd = (grid, row, col) => {
    const node = grid[row][col];
    return node.isEnd;
  };

  const dijkstra = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();

      if (closestNode.isWall) continue;

      if (closestNode.distance === Infinity) return visitedNodesInOrder;

      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);

      if (closestNode === endNode) return visitedNodesInOrder;

      updateUnvisitedNeighbors(closestNode, grid);
    }
  };

  const sortNodesByDistance = (unvisitedNodes) => {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
  };

  const getAllNodes = (grid) => {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  };

  const updateUnvisitedNeighbors = (node, grid) => {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  };

  const getUnvisitedNeighbors = (node, grid) => {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter((neighbor) => !neighbor.isVisited);
  };

  const getShortestPath = (endNode) => {
    const shortestPath = [];
    let currentNode = endNode;
    while (currentNode !== null) {
      shortestPath.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return shortestPath;
  };

  const animateDijkstra = (visitedNodesInOrder, shortestPath) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(shortestPath);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
      }, 10 * i);
    }
  };

  const animateShortestPath = (shortestPath) => {
    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const node = shortestPath[i];
        document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
      }, 50 * i);
    }
  };

  return (
    <div className="app">
      <button className="btn" onClick={visualizeDijkstra}>
        Visualize Dijkstra's Algorithm
      </button>
      <div className="grid">
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row">
              {row.map((node, colIndex) => {
                const { row, col, isStart, isEnd, isWall } = node;
                return (
                  <Node
                    key={colIndex}
                    row={row}
                    col={col}
                    isStart={isStart}
                    isEnd={isEnd}
                    isWall={isWall}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onMouseUp={handleMouseUp}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;


