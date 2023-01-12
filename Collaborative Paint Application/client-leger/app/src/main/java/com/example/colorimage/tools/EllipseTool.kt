package com.example.colorimage.tools

import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import com.example.colorimage.shapes.EllipseShape
import com.example.colorimage.Point
import com.example.colorimage.shapes.Shape
import com.example.colorimage.shapes.ShapeStack

class EllipseTool : Tool {

    private lateinit var newEllipse : EllipseShape

    override fun touchDown(point: Point) {
        // place ici for now
        val paint: Paint = Paint()
        paint.color = Color.BLACK
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 5f
        paint.isAntiAlias = true

        newEllipse = EllipseShape(RectF(), paint, RectF(), true)
        newEllipse.create(point)
        ShapeStack.add(newEllipse)
    }

    override fun touchMove(point: Point) {
        newEllipse.update(point)
    }

    override fun touchUp(point: Point) {
        newEllipse.setBoundingBox()
        newEllipse.selected = false
    }
}