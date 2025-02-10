import { Component } from '../component/Component'
import { ICanvasTable } from '../typings/CanvasTable'
import CanvasTable from '../core/CanvasTable'
import { BodyRow } from './BodyRow'
import { isEmpty } from '../utils/utils'
import { drawNoData } from '../utils/draw'
import { obj } from '../typings/common'

type ISectionProps = ICanvasTable.ISectionProps

export class BodySection extends Component {
    constructor(private props: ISectionProps) {
        super()
        this.init()
    }

    init() {
        this.table = this.props.table
        this.top = this.table.header.height
    }

    top: number
    get width() {
        return this.table.style.width
    }

    get height() {
        return (this.rows || []).reduce((pre, row) => pre + row.height, 0)
    }
    table: CanvasTable
    rows: BodyRow[] = []
    diff(newData: obj[]): BodyRow[] {
        if (isEmpty(newData)) {
            return []
        }

        return newData.map(
            (data, i) =>
                new BodyRow({
                    ctx: this.table.ctx,
                    table: this.table,
                    index: i,
                })
        )
    }
    render(start = 0, renderLen = this.table.source.length) {
        const headerHeight = this.table.header.height
        const bodyHeight = this.table.style.height - headerHeight
        const bodyWidth = this.table.style.width

        if (isEmpty(this.rows)) {
            this.rows = Array.from({ length: renderLen }).map(
                (_, i) => new BodyRow({
                    table: this.table,
                    index: start + i,
                })
            )
        }
        if (isEmpty(this.rows)) {
            drawNoData(this.table.ctx, 0, headerHeight, bodyWidth, bodyHeight, 140, this.table.style.textColor)
        } else {
            this.table.ctx.clearRect(0, headerHeight, bodyWidth, bodyHeight)
            this.rows.forEach((row) => row.innerRender())
        }
    }

    clear() {
        this.rows.forEach((row) => row.destroy())
        this.rows = []
    }
}
