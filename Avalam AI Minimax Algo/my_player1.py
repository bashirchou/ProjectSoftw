#!/usr/bin/env python3
"""
Avalam agent.
Copyright (C) 2022, <<<<<<<<<<< YOUR NAMES HERE >>>>>>>>>>>
Polytechnique Montréal

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; version 2 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see <http://www.gnu.org/licenses/>.

"""
from array import array
import math
import random
from avalam import *


class MyAgent(Agent):

    """My Avalam agent."""

    def play(self, percepts, player, step, time_left):
        """
        This function is used to play a move according
        to the percepts, player and time left provided as input.
        It must return an action representing the move the player
        will perform.
        :param percepts: dictionary representing the current board
            in a form that can be fed to `dict_to_board()` in avalam.py.
        :param player: the player to control in this step (-1 or 1)
        :param step: the current step number, starting from 1
        :param time_left: a float giving the number of seconds left from the time
            credit. If the game is not time-limited, time_left is None.
        :return: an action
            eg; (1, 4, 1 , 3) to move tower on cell (1,4) to cell (1,3)
        """
        print("percept:", percepts)
        print("player:", player)
        print("step:", step)
        print("time left:", time_left if time_left else '+inf')

        # TODO: Prendre en compte on est quel joueur (Player1: Rouge, -1; Player2: Jaune, 1)

        infinity = math.inf

        max_depth = 3
        
        towerOwnedSign = player

        def heuristic(board):
            score = 0
            towers = board.get_towers()
            for tower in towers:
                towerSign = player
                if tower[2] != 0:
                    towerSign = tower[2]/abs(tower[2])
                if abs(tower[2]) >= 5 and player == towerSign:
                    score += 10 
                if abs(tower[2]) >= 1 and not board.is_tower_movable(tower[0],tower[1]) and player == towerSign:
                    score += 10
            return score
          
        def adjacentCells(xCoord, yCoord,height):
            score = 0
            leftBottom = [xCoord-1,yCoord-1,0]
            left = [xCoord-1,yCoord,0]
            bottom = [xCoord,yCoord-1,0]
            right = [xCoord+1,yCoord,0]
            top = [xCoord,yCoord+1,0]
            rightbottom = [xCoord+1,yCoord-1,0]
            leftTop = [xCoord-1,yCoord+1,0]
            rightTop =  [xCoord+1,yCoord+1,0]
            arrayCorners = [leftBottom,left,bottom,right,top,rightbottom,leftTop,rightTop]
            arrayCorners = list(outOfRangeFix(arrayCorners))
            cornerchecked = 0
            for corner in arrayCorners:
                cornerSign = 1
                if corner[2] != 0:
                    cornerSign = corner[2]/abs(corner[2])
                if (abs(corner[2]) >= 1 or abs(corner[2]) == 0) and cornerSign == towerOwnedSign:
                    cornerchecked += 1
                if (abs(corner[2]) + abs(height) ) == 5 and cornerSign == height/abs(height)  and height/abs(height) != towerOwnedSign:
                    score -= 10
                    return score
            if cornerchecked == 8 and abs(height) == 4 or abs(height) == 3:
                 score += 2
            elif cornerchecked > 4 and abs(height) == 3:
                 score += 1
            return score
             
        def outOfRangeFix(arrayCorners):
            for a in  arrayCorners:
                if a[0] >= len(board.m) or a[0] < 0 or  a[1] >= len(board.m[0]) or a[1] < 0:
                        a[2] = 0
                else:
                    a[2] = board.m[a[0]][a[1]]
            return arrayCorners
            
        def max_value(state, alpha, beta, depth):
            if state.is_finished():
                return state.get_score(), None
            if depth > max_depth:
                return heuristic(state), None
            v, move = -infinity, None
            for a in state.get_actions():
                v2, _ = min_value(state.clone().play_action(a), alpha, beta, depth+1)
                if v2 > v:
                    v, move = v2, a
                    alpha = max(alpha, v)
                if v >= beta:
                    return v, move
            return v, move


        def min_value(state, alpha, beta, depth):
            if state.is_finished():
                return state.get_score(), None
            if depth > max_depth:
                return heuristic(state), None
            v, move = +infinity, None
            for a in state.get_actions():
                v2, _ = max_value(state.clone().play_action(a), alpha, beta, depth + 1)
                if v2 < v:
                    v, move = v2, a
                    beta = min(beta, v)
                if v <= alpha:
                    return v, move
            return v, move
        
        board = dict_to_board(percepts)
        # Création d'un board qui s'inverse si on est le joueur 2
        #board = Board(temp_board.get_percepts(player == PLAYER2))
        print("HAHAHAHAHAHAHAHHAA")
        
        if(step < 5):
            actions = list(board.get_actions())
            return random.choice(actions)
        else:
            action = max_value(board, -infinity, +infinity, 0)
            print("Score: ", action[0], "\n")
            return action[1]


if __name__ == "__main__":
    agent_main(MyAgent())

