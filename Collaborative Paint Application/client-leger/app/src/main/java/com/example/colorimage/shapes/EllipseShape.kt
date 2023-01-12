package com.example.colorimage.shapes

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import com.example.colorimage.Point

class EllipseShape(
    override var drawingShape: RectF,
    override var paint: Paint,
    override var boundingBox: RectF,
    override var selected: Boolean,
    ) : Shape() {

    private var initialCoord: Point = Point(0f, 0f)

    override fun draw(canvas: Canvas) {
        canvas.drawOval(drawingShape,paint)
        drawBoundingBox(canvas)
    }

    fun create(point: Point) {
        initialCoord.x = point.x
        initialCoord.y = point.y
    }

    fun setBoundingBox() {
        boundingBox = drawingShape
    }

    override fun update(point: Point) {
        drawingShape.left = initialCoord.x
        drawingShape.top = initialCoord.y
        drawingShape.right = drawingShape.left + (point.x - initialCoord.x)
        drawingShape.bottom = drawingShape.top + (point.y - initialCoord.y)
    }

    override fun translate(dx: Float, dy: Float) {
        drawingShape.offset(dx, dy)
        setBoundingBox()
    }

    override fun drawBoundingBox(canvas: Canvas) {
        if(selected){
            var newPaint = Paint()
            newPaint.style = Paint.Style.STROKE
            newPaint.strokeWidth = 1f
            newPaint.isAntiAlias = true
            newPaint.color = Color.RED
            canvas.drawRect(boundingBox,newPaint)
        }

    }

    override fun finishTranslation() {
        initialCoord.x =  drawingShape.left
        initialCoord.y =  drawingShape.top
    }


}