package com.example.colorimage.tools

import com.example.colorimage.Point
import com.example.colorimage.shapes.ShapeStack

class DeleteTool: Tool {


    override fun touchDown(point: Point) {
        ShapeStack.deleteSelectedShape()
    }

    override fun touchMove(point: Point) {

    }

    override fun touchUp(point: Point) {

    }

}