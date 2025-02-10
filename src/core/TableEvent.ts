import CanvasTable from './CanvasTable'
import Layer from '../component/Layer'
import { isEmpty, isNotEmptyArray } from '../utils/utils'
import { IComponent } from '../typings/Component'
import { LayerEvent } from './LayerEvent'
import { HeaderTree } from '../table/HeaderTree'
import { obj } from '../typings/common'

type IEventCollection = IComponent.IEventCollection

export class CanvasTableEvent {
    constructor(protected props: { table: CanvasTable }) {
        this.init()
    }

    init() {
        const wrapper = this.table.wrapper
        wrapper.addEventListener('click', (e) => this.eventHandler('onClick', e))
        wrapper.addEventListener('dblclick', (e) => this.eventHandler('onDoubleClick', e))
        wrapper.addEventListener('contextmenu', (e) => this.eventHandler('onContextMenu', e))
        wrapper.addEventListener('mousemove', (e) => this.moveEventHandler(e))
        wrapper.addEventListener('mouseleave', (e) => this.onMouseLeave(e))
    }

    eventX = 0
    eventY = 0
    eventHandler = (type: keyof IEventCollection, event) => {
        const { left, top } = this.table.wrapper.getBoundingClientRect()
        this.eventX = event.clientX - left
        this.eventY = event.clientY - top

        const layEvt = this.eventGenerate(type)
        for (let layer of layEvt.path) {
            if (!layEvt.isPropagationStopped) {
                layer.trigger(type, layEvt)
            }
        }
    }

    private lastMoveEvent: LayerEvent = null
    moveEventHandler = (event) => {
        const { left, top } = this.table.wrapper.getBoundingClientRect()
        this.eventX = event.clientX - left
        this.eventY = event.clientY - top

        const currEvt = this.eventGenerate('onMouseEnter')
        const lastEvt = this.lastMoveEvent ? this.lastMoveEvent.copy({ type: 'onMouseLeave' }) : null
        const currRevPath = currEvt && currEvt.path ? [...currEvt.path].reverse() : []
        const lastRevPath = lastEvt && lastEvt.path ? [...lastEvt.path].reverse() : []

        const length = Math.max(currRevPath.length, lastRevPath.length)

        for (let i = 0; i < length; i++) {
            const last = lastRevPath[i]
            const curr = currRevPath[i]
            if (last !== curr) {
                if (lastEvt && !lastEvt.isPropagationStopped) {
                    last && last.trigger(lastEvt.type, lastEvt)
                }

                if (!currEvt.isPropagationStopped) {
                    curr && curr.trigger(currEvt.type, currEvt)
                }
            }
        }

        this.lastMoveEvent = currEvt
    }

    onMouseLeave = (event: MouseEvent) => {
        this.eventGenerate('onMouseLeave')
        const lastEvt = this.lastMoveEvent ? this.lastMoveEvent.copy({ type: 'onMouseLeave' }) : null
        if (isEmpty(lastEvt)) {
            return
        }

        for (let layer of lastEvt.path) {
            if (!lastEvt.isPropagationStopped) {
                layer.trigger(lastEvt.type, lastEvt)
            }
        }
        this.lastMoveEvent = null
    }

    eventGenerate(type?: keyof IEventCollection): LayerEvent {
        return new LayerEvent({
            type,
            path: this.pathGet(type),
            clientX: this.eventX,
            clientY: this.eventY,
        })
    }

    pathGet(eventType?: string) {
        let entryLayer: Layer = null

        if (this.eventY <= this.table.header.height) {
            // Clicking takes effect in the header
            let cells = [...this.table.header.cells]
            cells.sort((a, b) => b.zIndex - a.zIndex)
            for (let headerCell of cells) {
                const { left, top, width, height } = headerCell
                if (
                    headerCell.isRender &&
                    left < this.eventX &&
                    left + width > this.eventX &&
                    top < this.eventY &&
                    top + height > this.eventY
                ) {
                    entryLayer = headerCell

                    // Trigger column sorting only for click events
                    if (eventType === 'onClick') {
                        this.sortColumn(headerCell)
                    }
                    if (eventType === 'onMouseEnter') {
                        this.table.ctx.canvas.parentElement.style.cursor = 'pointer'
                    }
                    break
                }
            }
        } else {
            // Click event takes effect in the body part
            if (eventType === 'onMouseEnter') {
                this.table.ctx.canvas.parentElement.style.cursor = 'auto'
            }
            for (let row of this.table.body.rows) {
                if (this.eventY > row.top && this.eventY < row.top + row.height) {
                    entryLayer = row
                    break
                }
            }
        }

        const clientCoordination = (layer: Layer, left = layer.left, top = layer.top) => {
            if (layer.parent) {
                return clientCoordination(layer.parent, left + layer.parent.left, top + layer.parent.top)
            } else {
                return { left, top }
            }
        }

        const pathDig = (layer: Layer, path: Layer[] = []): Layer[] => {
            path.push(layer)
            if (isNotEmptyArray(layer.children)) {
                const sortedChildren = [...layer.children].sort((a, b) => b.zIndex - a.zIndex)

                for (let child of sortedChildren) {
                    const { left, top, width, height } = child
                    // const {left, top} = clientCoordination(child);
                    if (
                        child.isRender &&
                        left < this.eventX &&
                        left + width > this.eventX &&
                        top < this.eventY &&
                        top + height > this.eventY
                    ) {
                        return pathDig(child, path)
                    }
                }
                return path
            } else {
                return path
            }
        }

        return entryLayer ? pathDig(entryLayer).reverse() : []
    }

    sortColumn(headerCell: Layer) {
        // @ts-ignore
        const columnKey = headerCell.props.colProps.dataIndex

        const currentSortOrder = this.table.sortOrder || 'asc'

        const columnProps = this.table.header.props.colProps.map((header) => {
            const rawTitle = header.title
                .toString()
                .replace(/ *\([↑↓]\) */g, '')
                .trim()
            if (header.dataIndex === columnKey) {
                header.title = `${rawTitle} (${currentSortOrder === 'asc' ? '↑' : '↓'})`
            } else {
                header.title = rawTitle
            }
            return header
        })
        const props = {
            ...this.table.header.props,
            colProps: columnProps,
        }
        this.table.header = new HeaderTree(props)
        this.table.header.render()

        const nextSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'

        const compare = (a: obj<any>, b: obj<any>) => {
            const valueA = a[columnKey]
            const valueB = b[columnKey]

            // Check if valueA and valueB are undefined or missing
            if (valueA === undefined || valueB === undefined) {
                console.error(`Invalid columnKey: ${columnKey}, valueA: ${valueA}, valueB: ${valueB}`)
                return 0 // Return 0 or adjust depending on your sorting logic
            }

            // Handle string comparison
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return nextSortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
            }

            // Handle price comparison (assume price is a string like "$12.56")
            if (
                typeof valueA === 'string' &&
                valueA.startsWith('$') &&
                typeof valueB === 'string' &&
                valueB.startsWith('$')
            ) {
                const numericValueA = parseFloat(valueA.replace('$', ''))
                const numericValueB = parseFloat(valueB.replace('$', ''))
                if (numericValueA < numericValueB) return nextSortOrder === 'asc' ? -1 : 1
                if (numericValueA > numericValueB) return nextSortOrder === 'asc' ? 1 : -1
                return 0
            }

            // Handle date comparison (assume date is in the format "YYYY-MM-DD")
            if (
                typeof valueA === 'string' &&
                typeof valueB === 'string' &&
                valueA.match(/^\d{4}-\d{2}-\d{2}$/) &&
                valueB.match(/^\d{4}-\d{2}-\d{2}$/)
            ) {
                const dateA = new Date(valueA)
                const dateB = new Date(valueB)
                if (dateA < dateB) return nextSortOrder === 'asc' ? -1 : 1
                if (dateA > dateB) return nextSortOrder === 'asc' ? 1 : -1
                return 0
            }

            // Handle number comparison
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                if (valueA < valueB) return nextSortOrder === 'asc' ? -1 : 1
                if (valueA > valueB) return nextSortOrder === 'asc' ? 1 : -1
                return 0
            }
            return 0
        }

        // Sort the table data
        const sourceCopy = this.table.source
        sourceCopy.sort(compare)
        this.table.source = sourceCopy

        // Save sort state and re-render
        this.table.sortOrder = nextSortOrder
        this.table.render()
    }

    get table() {
        return this.props.table
    }
}
