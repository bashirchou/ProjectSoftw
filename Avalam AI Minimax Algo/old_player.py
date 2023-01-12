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

        def heuristic(board):
            score = board.get_score()
            return score

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
                return heuristic(state), None
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
        
        
        temp_board = dict_to_board(percepts)
        # Création d'un board qui s'inverse si on est le joueur 2
        board = Board(temp_board.get_percepts(player == PLAYER2))

        action = max_value(board, -infinity, +infinity, 0)
        print("Score: ", action[0], "\n")
        return action[1]


if __name__ == "__main__":
    agent_main(MyAgent())