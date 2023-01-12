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
    lrows = 0
    lcolumns = 0
    urows = 8
    ucolumns = 8
    

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
            self.lrows = 0
            self.lcolumns = 0
            self.urows = 8
            self.ucolumns = 8
        elif (step == 2 and player== -1):
            self.lrows = 0
            self.lcolumns = 0
            self.urows = 8
            self.ucolumns = 8
        # Création d'un board qui s'inverse si on est le joueur 2
        board = Board(temp_board.get_percepts(player == PLAYER2))

        self.position_of_interest(temp_board.get_percepts(player == PLAYER2), step)

        action = self.max_value(board, -infinity, +infinity, 0, step)
        print("Score: ", action[0], "\n")
        print("BOARD MOVES", self.ucolumns, self.urows, self.lrows, self.lcolumns)
        self.previous_board = board.clone().play_action(action[1]).get_percepts(player == PLAYER2)
        return action[1]

    def heuristic(state):
        """The evaluate function must return an integer value
        representing the utility function of the board.
        """
        tower=0
        towMax=0
        towIsol=0
        towOne=0
        towTwo=0
        towThree=0
        towFour=0
        for i in range(state.rows):
            for j in range(state.columns):
                """number of tower for each player"""
                tow=state.m[i][j]

                if tow !=0 :
                    number=abs(tow)
                    s=tow/number
                    if tow < 0:
                        tower -= 1
                        if tow == -5 :
                            towMax-=1
                    elif tow > 0:
                        tower += 1
                        if tow == 5 :
                            towMax+=1


                    if(not state.is_tower_movable(i,j) and not(number==5)):
                        if tow < 0:
                            towIsol -= 1
                        elif tow > 0:
                            towIsol += 1
                        if number == 1:
                            towOne+=s*2
                        elif number == 2:
                            towTwo+=s*4
                        elif number == 3:
                            towThree+=s*6
                        else:
                            towFour+=s*8
                    elif(state.is_tower_movable(i,j) and not(number==5)):
                        if number == 1:
                            towOne+=s
                        elif number == 2:
                            towTwo+=s*2
                        elif number == 3:
                            towThree+=s*3
                        else:
                            towFour+=s*4
        towTot=towOne+towTwo+towThree+towFour
        return tower + 5*towMax + 5*towIsol + towTot

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
        if(step < 10):
            self.urows = (self.poi[0] + 2)
            self.ucolumns = (self.poi[1] + 2)
            self.lrows = (self.poi[0] - 2) 
            self.lcolumns = (self.poi[1] - 2)
            towers = self.get_Towers_Modified(board)
            for tower in towers:
                if(tower[0] <= self.urows and tower[0] >=  self.lrows   and tower[1] <= self.ucolumns and tower[1] >=self.lcolumns):
                    for action in board.get_tower_actions(tower[0], tower[1]):
                        yield action
        elif(step < 20):
            self.urows = (self.poi[0] + 3)
            self.ucolumns = (self.poi[1] + 3)
            self.lrows = (self.poi[0] - 3) 
            self.lcolumns = (self.poi[1] - 3)
            towers = self.get_Towers_Modified(board)
            for tower in towers:
                if(tower[0] <= self.urows  and tower[0] >=  self.lrows and tower[1] <=  self.ucolumns and tower[1] >=self.lcolumns):
                    for action in board.get_tower_actions(tower[0], tower[1]):
                        yield action
        else:
            self.urows = 7
            self.ucolumns = 7
            self.lrows = 0
            self.lcolumns = 0
            towers = self.get_Towers_Modified(board)
            for tower in towers:
                for action in board.get_tower_actions(tower[0], tower[1]):
                    yield action
    
    def get_max_depth(self, step):
        if   step < 25: return 3
        elif step < 30: return 4
        else: return 10


    previous_board = Board.initial_board

    def last_move_position(self, percepts):
        for i in range(9):
            for j in range(9):
                if ((self.previous_board[i][j] - percepts[i][j]) != 0):
                    return i, j
        return 0,0

    poi = [0, 0]

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
    
    def get_Towers_Modified(self,board):
        for i in range(self.lrows, self.urows + 2):
            for j in range(self.lcolumns, self.ucolumns + 2):
                if board.m[i][j]:
                    yield (i, j, board.m[i][j])





if __name__ == "__main__":
    agent_main(MyAgent())