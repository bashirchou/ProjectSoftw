package com.example.colorimage.tools

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import com.example.colorimage.*
import com.example.colorimage.shapes.PathShape
import com.example.colorimage.shapes.RectangleShape
import com.example.colorimage.shapes.Shape
import com.example.colorimage.shapes.ShapeStack

class RectangleTool : Tool {

    private lateinit var newRectangle: RectangleShape

    override fun touchDown(point: Point) {
        val paint = Paint()
        paint.color = Color.BLACK
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 5f
        paint.isAntiAlias = true
        newRectangle = RectangleShape(RectF(), paint,RectF(),true)
        newRectangle.create(point)
        ShapeStack.add(newRectangle)
    }

    override fun touchMove(point: Point) {
        newRectangle.update(point)

    }

    override fun touchUp(point: Point) {
        newRectangle.setBoundingBox()
        newRectangle.selected = false
    }
}