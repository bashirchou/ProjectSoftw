#!/usr/bin/env python3
"""
Avalam agent.
Copyright (C) 2022, <<<<<<<<<<< Labib Bashir-Choudhury (1995039), Youssef Beloufa (1955935)  >>>>>>>>>>>
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
    action_counter = 0
    infinity = math.inf

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
      
        # Creates a board the inverts if we are Player 2
        temp_board = dict_to_board(percepts)        
        board = Board(temp_board.get_percepts(player == PLAYER2))

        self.position_of_interest(temp_board.get_percepts(player == PLAYER2), step)
        self.action_counter = 0

        action = self.max_value(board, -self.infinity, +self.infinity, 0, step)
        print("Score: ", action[0], "\n")
        print("Counter: ", self.action_counter, "\n")
        self.previous_board = board.clone().play_action(action[1]).get_percepts(player == PLAYER2)
        return action[1]

    def heuristic(self, board, step):
        score = board.get_score()
        towers = self.towers_of_interest(board, step)
        for tower in towers:
            if not board.is_tower_movable(tower[0],tower[1]) and (board.m[tower[0]][tower[1]] >= 1):
                score += 3
            elif not board.is_tower_movable(tower[0],tower[1]) and (board.m[tower[0]][tower[1]] <= -1):
                score -= 3
        return score

    """
       Max function of the Minimax algorithm.
        :param state: Board object representing the current board
        :param alpha: Current alpha value for alpha-beta pruning
        :param beta: Current beta value for alpha-beta pruning
        :param depth: Current depth we are looking at in the Minimax tree
        :param step: The current turn number for the game
        :return: a score and an action
    """
    def max_value(self, state, alpha, beta, depth, step):        
        infinity = math.inf
        self.action_counter += 1
        if self.action_counter > 500000:
            return self.heuristic(state, step), None
        if state.is_finished():
            return self.heuristic(state, step), None
        if depth > self.get_max_depth(step):
            return self.heuristic(state, step), None
        v, move = -infinity, None
        for a in self.newActions(state, step):
            v2, _ = self.min_value(state.clone().play_action(a), alpha, beta, depth+1, step)
            if v2 > v:
                v, move = v2, a
                alpha = max(alpha, v)
            if v >= beta:
                return v, move
        return v, move

    """
       Min function of the Minimax algorithm.
        :param state: Board object representing the current board
        :param alpha: Current alpha value for alpha-beta pruning
        :param beta: Current beta value for alpha-beta pruning
        :param depth: Current depth we are looking at in the Minimax tree
        :param step: The current turn number for the game
        :return: a score and an action
    """
    def min_value(self, state, alpha, beta, depth, step):
        infinity = math.inf
        self.action_counter += 1
        if self.action_counter > 500000:
            return self.heuristic(state, step), None
        if state.is_finished():
            return self.heuristic(state, step), None
        if depth > self.get_max_depth(step):
            return self.heuristic(state, step), None
        v, move = +infinity, None
        for a in self.newActions(state, step):
            v2, _ = self.max_value(state.clone().play_action(a), alpha, beta, depth + 1, step)
            if v2 < v:
                v, move = v2, a
                beta = min(beta, v)
            if v <= alpha:
                return v, move
        return v, move

    """
       Gives the actions to consider for this turn.
        :param board: Board object representing the current board
        :param step: The current turn number for the game
        :yield: All considered actions
    """
    def newActions(self, board, step):        
        towers = self.towers_of_interest(board, step)
        for tower in towers:        
            for action in board.get_tower_actions(tower[0], tower[1]):
                yield action        
    
    """
       Function to get the max depth to reach in the Minimax tree
        :param step: The current turn number for the game
        :return: The depth
    """
    def get_max_depth(self, step):
        if   step < 20: return 3
        elif step < 30: return 4
        else: return 5


    previous_board = Board.initial_board

    """
       Function that determines the position of the last move done by the opponent
        :param percepts: dictionary representing the current board
            in a form that can be fed to `dict_to_board()` in avalam.py.
        :return: an x and y coordinate of the action
    """
    def last_move_position(self, percepts):
        for i in range(9):
            for j in range(9):
                if ((self.previous_board[i][j] - percepts[i][j]) != 0):
                    return i, j
        return 0,0

    poi = [0, 0]

    """
       Function that adjusts the position around which actions will be 
       considered for this turn. Depends on the last move done by the opponent
       on is modified if this move is close to an edge of the board.
        :param percepts: dictionary representing the current board
            in a form that can be fed to `dict_to_board()` in avalam.py.
        :param step: The current turn number for the game
        :return: an x and y coordinate of the position of interest
    """
    def position_of_interest(self, percepts, step):
        i, j = self.last_move_position(percepts)

        if (step < 10):
            if  (i < 2): i = 2
            elif(i > 6): i = 6            
            if  (j < 2): j = 2
            elif(j > 6): j = 6
        elif(step < 20):
            if  (i < 3): i = 3
            elif(i > 5): i = 5
            if  (j < 3): j = 3
            elif(j > 5): j = 5

        self.poi = [i, j]
    
    """
       Finds the towers to consider for this turn.
        :param board: Board object representing the current board
        :param step: The current turn number for the game
        :yield: All considered Towers
    """
    def towers_of_interest(self, board, step):
        if(step < 10):        
            for i in range(self.poi[0] - 2, self.poi[0] + 3):
                for j in range(self.poi[1] - 2, self.poi[1] + 3):
                    if board.m[i][j]:
                        yield (i, j)
        elif(step < 20):
            for i in range(self.poi[0] - 3, self.poi[0] + 4):
                for j in range(self.poi[1] - 3, self.poi[1] + 4):
                    if board.m[i][j]:
                        yield (i, j)
        else:
            for tower in board.get_towers():
                yield (tower[0], tower[1])



if __name__ == "__main__":
    agent_main(MyAgent())