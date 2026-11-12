// Overlay et cadres des templates classiques (Jour, Saint).

import type { Template } from '../templates'
import { hexToRgb } from '../utils'
import type { CanvasState } from './types'
import { scaleMin } from './helpers'
import { getLogoPosition } from './logo'
import { drawRegardCielFrame } from './regard-ciel'
import { drawEvangileFrame } from './evangile'
import { drawHistoireFrame } from './histoire'

export function drawOverlay(ctx: CanvasRenderingContext2D, state: CanvasState): void {
  const canvas = ctx.canvas
  const opacity = state.overlayOpacity / 100
  const { r, g, b } = hexToRgb(state.overlayColor)
  
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

export function drawFrame(ctx: CanvasRenderingContext2D, template: Template, state: CanvasState): void {
  const canvas = ctx.canvas
  ctx.strokeStyle = state.frameColor
  ctx.lineWidth = 8

  switch (template.frameStyle) {
    case 'circular':
      drawCircularFrame(ctx, canvas)
      break
    case 'geometric':
      drawGeometricFrame(ctx, canvas, state)
      break
    case 'ornate':
      drawOrnateFrame(ctx, canvas, state)
      break
    case 'geometric-sacred':
      drawSacredGeometryFrame(ctx, canvas)
      break
    case 'regard-ciel':
    case 'regard-ciel-nom':
    case 'regard-ciel-citation':
      drawRegardCielFrame(ctx, canvas, template.frameStyle)
      break
    case 'evangile-simple':
    case 'evangile-verset':
    case 'evangile-narratif':
      drawEvangileFrame(ctx, canvas, template.frameStyle)
      break
    case 'histoire-classique':
    case 'histoire-fiche':
    case 'histoire-portrait':
      drawHistoireFrame(ctx, canvas, template.frameStyle, state)
      break
    default:
      drawElegantFrame(ctx, canvas)
  }
}

export function drawCircularFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const r1 = scaleMin(400, canvas)
  const r2 = scaleMin(420, canvas)
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, r1, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, r2, 0, Math.PI * 2)
  ctx.stroke()
}

export function drawGeometricFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: CanvasState): void {
  const margin = scaleMin(60, canvas)
  const logo = getLogoPosition(canvas)

  drawFrameWithLogoCutout(ctx, canvas, margin, logo, state.frameColor)

  const cornerSize = scaleMin(40, canvas)
  ctx.lineWidth = 6
  drawCornerDecoration(ctx, margin, margin, cornerSize)
  drawCornerDecoration(ctx, canvas.width - margin, margin, cornerSize, true)
  drawCornerDecoration(ctx, margin, canvas.height - margin, cornerSize, false, true)
}

export function drawCornerDecoration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  flipH = false,
  flipV = false
): void {
  ctx.save()
  ctx.translate(x, y)
  if (flipH) ctx.scale(-1, 1)
  if (flipV) ctx.scale(1, -1)
  
  ctx.beginPath()
  ctx.moveTo(0, size)
  ctx.lineTo(0, 0)
  ctx.lineTo(size, 0)
  ctx.stroke()
  
  ctx.restore()
}

// Draw a rectangular frame with a smooth cutout for the logo in bottom-right corner
export function drawFrameWithLogoCutout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  margin: number,
  logo: { x: number; y: number; radius: number },
  frameColor: string
): void {
  const left = margin
  const top = margin
  const right = canvas.width - margin
  const bottom = canvas.height - margin
  
  // Calculate cutout dimensions
  const cutoutSize = logo.radius + 10  // Extra padding
  const cutoutStartX = logo.x - cutoutSize
  const cutoutStartY = logo.y - cutoutSize
  const curveRadius = 20  // Radius for smooth corners
  
  ctx.strokeStyle = frameColor
  
  ctx.beginPath()
  
  // Start from top-left corner
  ctx.moveTo(left, top)
  
  // Top edge
  ctx.lineTo(right, top)
  
  // Right edge - go down to cutout
  ctx.lineTo(right, cutoutStartY - curveRadius)
  
  // Smooth curve into horizontal cutout
  ctx.quadraticCurveTo(right, cutoutStartY, right - curveRadius, cutoutStartY)
  
  // Horizontal line toward logo
  ctx.lineTo(cutoutStartX + curveRadius, cutoutStartY)
  
  // Smooth curve down
  ctx.quadraticCurveTo(cutoutStartX, cutoutStartY, cutoutStartX, cutoutStartY + curveRadius)
  
  // Vertical line down to bottom edge level
  ctx.lineTo(cutoutStartX, bottom - curveRadius)
  
  // Smooth curve to bottom edge
  ctx.quadraticCurveTo(cutoutStartX, bottom, cutoutStartX - curveRadius, bottom)
  
  // Bottom edge to left
  ctx.lineTo(left, bottom)
  
  // Left edge back to start
  ctx.lineTo(left, top)
  
  ctx.stroke()
}

export function drawOrnateFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: CanvasState): void {
  const margin = scaleMin(50, canvas)
  const logo = getLogoPosition(canvas)

  ctx.lineWidth = 10
  drawFrameWithLogoCutout(ctx, canvas, margin, logo, state.frameColor)

  ctx.lineWidth = 4
  drawFrameWithLogoCutout(ctx, canvas, margin + scaleMin(20, canvas), logo, state.frameColor)

  const cornerPositions = [
    { x: margin, y: margin },
    { x: canvas.width - margin, y: margin },
    { x: margin, y: canvas.height - margin },
  ]
  cornerPositions.forEach(pos => {
    ctx.save()
    ctx.translate(pos.x, pos.y)
    ctx.fillStyle = state.frameColor
    ctx.beginPath()
    ctx.arc(0, 0, scaleMin(8, canvas), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

export function drawSacredGeometryFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const r = scaleMin(380, canvas)

  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - r)
  ctx.lineTo(centerX + r, centerY)
  ctx.lineTo(centerX, centerY + r)
  ctx.lineTo(centerX - r, centerY)
  ctx.closePath()
  ctx.stroke()
}

export function drawElegantFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const margin = scaleMin(70, canvas)
  const logo = getLogoPosition(canvas)
  const frameColor = ctx.strokeStyle as string

  ctx.lineWidth = 6
  drawFrameWithLogoCutout(ctx, canvas, margin, logo, frameColor)

  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6
  drawFrameWithLogoCutout(ctx, canvas, margin + scaleMin(15, canvas), logo, frameColor)
  ctx.globalAlpha = 1.0
}
