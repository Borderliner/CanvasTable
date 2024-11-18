import { Component } from '../component/Component'
import { ICanvasTable } from '../typings/CanvasTable'
import HeaderTreeNode from './HeaderTreeNode'
import { isEmpty } from '../utils/utils'
import { treeBFEach, treeEach, treeGetLeaf } from '../utils/tree'
import { Column } from './Column'
import { drawLine, drawRect } from '../utils/draw'

type IColumn = ICanvasTable.IColumn
type ITableHeaderProps = ICanvasTable.ITableHeaderProps

export class HeaderTree extends Component {
  constructor(private props: ITableHeaderProps) {
    super()
    const columnsProps = columnsPropsRearrange(props.colProps)
    this.columnsInit(columnsProps)
    this.cellNodesInit(columnsProps)
  }
  // The leaf node of the column configuration is the key to controlling the column (except for the lock column attribute), so these four attributes are the columns corresponding to the leaf node
  columns: Column[] = []
  leftColumns: Column[] = []
  rightColumns: Column[] = []
  notFixedColumns: Column[] = []
  /*
   * Column processing rules:
   * 1. The title attribute is effective at each level
   * 2. The fixed field can only be set at the first level, and the child nodes will automatically inherit it
   * 3. Align can be set, and if not set, it will inherit the parent node
   * 4. All other attributes will only take effect if they are set at the leaf node
   */
  columnsInit({ fixedLeft, notFixed, fixedRight }: { [key: string]: IColumn[] }) {
    // Initialize Column
    let colIndex = 0
    const propsArr = [fixedLeft, notFixed, fixedRight]
    const colArr = [this.leftColumns, this.notFixedColumns, this.rightColumns]
    // All header cells inherit the fixed property of the first layer
    ;[...fixedLeft, ...fixedRight, ...notFixed].forEach((rootCol) => {
      treeEach(rootCol, (colProps) => {
        colProps.fixed = rootCol.fixed
      })
    })
    propsArr.forEach((colProps, i) => {
      treeGetLeaf(colProps).forEach((prop) => {
        colArr[i].push(
          new Column({
            ...prop,
            table: this.props.table,
            index: colIndex++,
          })
        )
      })
    })
    this.columns = [...this.leftColumns, ...this.notFixedColumns, ...this.rightColumns]
  }

  deep: number = 1 // depth
  rootCells: HeaderTreeNode[] = [] // The first layer of cells
  leafCells: HeaderTreeNode[] = [] // Leaf layer cells
  cellNodesInit({ fixedLeft, notFixed, fixedRight }: { [key: string]: IColumn[] }) {
    const propsQueue = [...fixedLeft, ...notFixed, ...fixedRight]
    const PARENT_KEY = '__PARENT__'
    let node: HeaderTreeNode = null
    const table = this.table

    while (propsQueue[0]) {
      const currProps = propsQueue.shift()
      node = new HeaderTreeNode({
        colProps: currProps,
        popTitle: currProps.popTitle,
        parent: currProps[PARENT_KEY],
        table: table,
        ctx: table.ctx,
        style: {
          padding: [0, table.style.padding],
        },
      })
      if (isEmpty(currProps[PARENT_KEY])) {
        this.rootCells.push(node)
      }
      delete currProps[PARENT_KEY]

      if (Array.isArray(currProps.children)) {
        propsQueue.push(
          ...currProps.children.map((child) => {
            return {
              [PARENT_KEY]: node,
              ...child,
            }
          })
        )
      }
    }

    if (node) {
      this.deep = node.treeHeight
    }
    this.leafCells = treeGetLeaf(this.rootCells, 'childrenCell')
  }

  get cells() {
    let cells: HeaderTreeNode[] = []
    treeBFEach(this.rootCells, (cell) => cells.push(cell), 'childrenCell')
    return cells
  }

  top: number = 0
  get width() {
    return this.table.width
  }
  get height() {
    return this.deep * this.table.style.headerRowHeight
  }
  get table() {
    return this.props.table
  }

  render() {
    if (isEmpty(this.rootCells)) {
      return
    }
    const ctx = this.table.ctx

    drawRect(ctx, 0, 0, this.table.style.width, this.height, this.table.style.headerBackColor)
    drawLine(ctx, 0, this.height - 1, this.table.style.width, this.height - 1)
    const fixLeftCells = this.rootCells.filter((cell) => cell.fixed === 'left')
    const fixRightCells = this.rootCells.filter((cell) => cell.fixed === 'right')
    const notFixedCells = this.rootCells.filter((cell) => cell.fixed !== 'left' && cell.fixed !== 'right')
    ctx.save()
    ctx.beginPath()

    let leftWidth = fixLeftCells.reduce((pre, curr) => pre + curr.width, 0)
    let centerWidth = notFixedCells.reduce((pre, curr) => pre + curr.width, 0)
    // let rightWidth = notFixedCells.reduce((pre, curr) => pre + curr.width, 0);
    ctx.rect(leftWidth, 0, centerWidth, this.height)
    ctx.clip()
    treeBFEach(notFixedCells, (cell) => cell.innerRender(), 'childrenCell')
    ctx.restore()

    treeBFEach(fixLeftCells, (cell) => cell.innerRender(), 'childrenCell')
    treeBFEach(fixRightCells, (cell) => cell.innerRender(), 'childrenCell')
  }
}

function columnsPropsRearrange(colProps: IColumn[]) {
  // Arrange the order of columns according to the lock column configuration
  const fixedLeft = colProps
    .filter((col) => col.fixed === 'left')
    .map((col, i) => {
      return { ...col, fixedIndex: i }
    })
  const fixedRight = colProps
    .filter((col) => col.fixed === 'right')
    .map((col, i) => {
      return { ...col, fixedIndex: i }
    })
  const notFixed = colProps.filter((col) => !['left', 'right'].includes(col.fixed))

  return { fixedLeft, notFixed, fixedRight }
}
