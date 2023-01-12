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
import math
from avalam import *


class MyAgent(Agent):

    """My Avalam agent."""
    rows = 8
    columns = 8
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

        infinity = math.inf

               
        
        
        temp_board = dict_to_board(percepts)
        if(step == 1 and player == 1):
            self.rows = 8
            self.columns = 8
        elif (step == 2 and player== -1):
            self.rows = 8
            self.columns = 8
        # Création d'un board qui s'inverse si on est le joueur 2
        board = Board(temp_board.get_percepts(player == PLAYER2))
        action = self.max_value(board, -infinity, +infinity, 0, step)
        print("Score: ", action[0], "\n")
        print("Rows + columns", self.rows, self.columns)
        return action[1]

    def heuristic(self, board):
        score = board.get_score()
        towers =  self.get_Towers_Modified(board)
        for tower in towers:
            if not board.is_tower_movable(tower[0],tower[1]) and (tower[2] >= 1):
                score += 10
            elif not board.is_tower_movable(tower[0],tower[1]) and (tower[2] <= -1):
                score -= 10
            elif tower[2] == -2:
                score += 2
            elif tower[2] == -3:
                score += 2
        return score

    def max_value(self, state, alpha, beta, depth, step):        
        infinity = math.inf
        
        if state.is_finished():
            return self.heuristic(state), None
        if depth > self.get_max_depth(step):
            return self.heuristic(state), None
        v, move = -infinity, None
        for a in self.newActions(state, step):
            v2, _ = self.min_value(state.clone().play_action(a), alpha, beta, depth+1, step)
            if v2 > v:
                v, move = v2, a
                alpha = max(alpha, v)
            if v >= beta:
                return v, move
        return v, move


    def min_value(self, state, alpha, beta, depth, step):
        infinity = math.inf

        if state.is_finished():
            return self.heuristic(state), None
        if depth > self.get_max_depth(step):
            return self.heuristic(state), None
        v, move = +infinity, None
        for a in self.newActions(state, step):
            v2, _ = self.max_value(state.clone().play_action(a), alpha, beta, depth + 1, step)
            if v2 < v:
                v, move = v2, a
                beta = min(beta, v)
            if v <= alpha:
                return v, move
        return v, move

    def newActions(self, board, step):
            if(step <= 15):
                self.rows = 5
                self.columns = 5
                towers = self.get_Towers_Modified(board)
                for tower in towers:
                    if(tower[0] < self.rows and tower[1] <  self.columns):
                        for  action in board.get_tower_actions(tower[0], tower[1]):
                            yield action
            elif(step < 25):
                self.rows = 7
                self.columns = 7
                towers = self.get_Towers_Modified(board)
                for tower in towers:
                    if(tower[0] <  self.rows and tower[1] <  self.columns):
                        for  action in board.get_tower_actions(tower[0], tower[1]):
                            yield action
            else:
                self.rows = 8
                self.columns = 8
                towers = self.get_Towers_Modified(board)
                for tower in towers:
                    
                    for action in board.get_tower_actions(tower[0], tower[1]):
                        yield action
    
    def get_max_depth(self, step):        
        if   step < 25: return 3
        elif step < 30: return 4
        else: return 10

        """if   step < 10: return 2
        elif step < 20: return 3
        elif step < 25: return 4
        else: return 5"""
    def get_Towers_Modified(self,board):
        for i in range(self.rows + 1):
            for j in range(self.columns + 1):
                if board.m[i][j]:
                    yield (i, j, board.m[i][j])


if __name__ == "__main__":
    agent_main(MyAgent())