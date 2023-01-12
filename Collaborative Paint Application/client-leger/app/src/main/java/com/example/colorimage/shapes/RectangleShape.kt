package com.example.colorimage.shapes

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import com.example.colorimage.Point

class RectangleShape(
    override var drawingShape: RectF,
    override var paint: Paint,
    override var boundingBox: RectF,
    override var selected: Boolean,
    ) : Shape() {

    private var initialCoord: Point = Point(0f,0f)

    override fun draw(canvas: Canvas) {
        canvas.drawRect(drawingShape,paint)
    }

    fun create(point: Point){
        initialCoord.x = point.x
        initialCoord.y = point.y
    }

    override fun update(point: Point) {
        drawingShape.left = initialCoord.x
        drawingShape.top = initialCoord.y
        drawingShape.right = drawingShape.left + (point.x - initialCoord.x)
        drawingShape.bottom = drawingShape.top + (point.y - initialCoord.y)
        boundingBox = drawingShape
    }

    override fun translate(dx: Float, dy: Float) {
        drawingShape.offset(dx, dy)
        boundingBox = drawingShape

    }

    override fun drawBoundingBox(canvas: Canvas) {

        if(selected){
           //todo check if necessary maybe just redraw with different color
        }
    }

    override fun finishTranslation() {
        initialCoord.x =  drawingShape.left
        initialCoord.y =  drawingShape.top
    }

    fun setBoundingBox() {
       boundingBox = drawingShape
    }

}