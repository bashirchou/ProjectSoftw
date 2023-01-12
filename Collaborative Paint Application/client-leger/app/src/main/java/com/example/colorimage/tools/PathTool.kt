package com.example.colorimage.tools

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import com.example.colorimage.*
import com.example.colorimage.shapes.PathShape
import com.example.colorimage.shapes.ShapeStack

class PathTool : Tool {

    private lateinit var newPath: PathShape

    override fun touchDown(point: Point) {
        val paint = Paint()
        paint.color = Color.BLACK
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 5f
        paint.isAntiAlias = true

        newPath = PathShape(Path(), paint, RectF(), true)
        newPath.create(point)
        ShapeStack.add(newPath)
    }

    override fun touchMove(point: Point) {
        newPath.update(point)
    }

    override fun touchUp(point: Point) {
        newPath.setBoundingBox()
        newPath.selected = false
    }
}