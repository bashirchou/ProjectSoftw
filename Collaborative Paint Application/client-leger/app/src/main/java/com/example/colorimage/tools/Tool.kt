package com.example.colorimage.tools

import com.example.colorimage.Point

interface Tool {
    fun touchDown(point: Point)
    fun touchMove(point: Point)
    fun touchUp(point: Point)
}