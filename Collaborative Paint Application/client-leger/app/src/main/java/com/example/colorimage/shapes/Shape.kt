package com.example.colorimage.shapes

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import com.example.colorimage.Point

abstract class Shape () {
     abstract fun draw(canvas: Canvas)
     abstract fun update(point: Point)
     abstract fun translate(dx: Float, dy: Float)
     abstract fun drawBoundingBox(canvas : Canvas)
     abstract fun finishTranslation()

     abstract val drawingShape: Any
     abstract var paint : Paint
     abstract var boundingBox: RectF
     abstract var selected : Boolean

}