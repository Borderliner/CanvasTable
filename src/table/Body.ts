import { Component } from '../component/Component'
import { ICanvasTable } from '../typings/CanvasTable'
import CanvasTable from '../core/CanvasTable'
import { BodyRow } from './BodyRow'
import { isEmpty } from '../utils/utils'
import { noData } from '../utils/draw'
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
    // const {rowKey} = this.table.props;
    // const keyObj:obj = {};
    // const keyRow:obj<BodyRow> = {};
    // const keySortArr = [];
    // const getKey = data => data.__key__ || data[rowKey];

    // if (isEmpty(getKey(newData[0]))) {
    return newData.map(
      (data, i) =>
        new BodyRow({
          ctx: this.table.ctx,
          table: this.table,
          index: i,
        })
    )
    // } else {
    //   newData.forEach(data => {
    //     keyObj[getKey(data)] = data;
    //     keySortArr.push(getKey(data))
    //   });
    //   this.rows.forEach(row => {
    //     keyRow[getKey(row.data)] = row
    //   });
    //   // Same direct replacement
    //   Object.keys(keyObj).forEach(key => {
    //     if (keyRow && keyRow[key]) {
    //       keyObj[key] = keyRow[key]
    //     }
    //   });
    //   // Finding different rows
    //   return keySortArr.map((key, i) => {
    //     const obj = keyObj[key];
    //     if (obj instanceof BodyRow) {
    //       obj.update();
    //       obj.index = i;
    //       return obj
    //     } else {
    //       const table = this.table;
    //       return new BodyRow({
    //         ctx: table.ctx,
    //         table: table,
    //         index: i
    //       })
    //     }
    //   });
    // }
  }
  render(start = 0, renderLen = this.table.source.length) {
    // const dataLen = this.source.length;
    // const rowLen = this.body.rows.length;
    // // The number of rows that need to be rendered is greater than the number of rows that need to be added
    // if (renderLen > rowLen) {
    //
    // }
/*     if (isEmpty(this.rows)) {
      this.rows = Array.from({ length: renderLen }).map(
        (nul, i) =>
          new BodyRow({
            table: this.table,
            index: start + i,
          })
      )
    } */
    if (isEmpty(this.rows)) {
      const headerHeight = this.table.header.height
      const bodyHeight = this.table.style.height - headerHeight
      const bodyWidth = this.table.style.width

      noData(this.table.ctx, 0, headerHeight, bodyWidth, bodyHeight)
    } else {
      this.rows.forEach((row) => row.innerRender())
    }
  }
  clear() {
    this.rows.forEach((row) => row.destroy())
    this.rows = []
  }
}
