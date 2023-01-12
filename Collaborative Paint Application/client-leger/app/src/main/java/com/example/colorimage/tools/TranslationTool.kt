package com.example.colorimage.tools

import com.example.colorimage.Point
import com.example.colorimage.shapes.Shape

class TranslationTool: Tool {

    private var initialCoord: Point = Point (0f, 0f)

    private lateinit var currentShape: Shape

    override fun touchDown(point: Point) {
        initialCoord.x = point.x
        initialCoord.y = point.y

    }

    override fun touchMove(point: Point) {
        var move = computeTranslation(point)
        currentShape.translate(move.x, move.y)

    }

    private fun computeTranslation(deplacement: Point) : Point {

        return  Point(initialCoord.x - deplacement.x, initialCoord.y - deplacement.y)
    }

    override fun touchUp(point: Point) {

    }
}